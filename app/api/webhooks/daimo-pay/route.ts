import { NextResponse } from 'next/server';
import { db, Prisma } from '@/server/db';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';
import { DAIMO_PAY_WEBHOOK_SECRET } from '@/lib/constant/server';
import { DaimoPayWebhookPayloadSchema } from '@/lib/api/types/webhooks';
import { executeGatewayPledge } from '@/lib/api/pledges/execute-gateway-pledge';
import { debugApi as debug } from '@/lib/debug';

// Type for payment with includes
type PaymentWithIncludes = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    campaign: true;
  };
}>;

export async function POST(req: Request) {
  try {
    debug &&
      console.log('Daimo Pay webhook called:', {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(
          Array.from(req.headers.entries()).map(([key, value]) => [
            key,
            key.toLowerCase() === 'authorization' ? '[REDACTED]' : value,
          ]),
        ),
      });

    // Verify Daimo Pay webhook authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.warn(
        'Daimo Pay webhook: Missing or invalid Authorization header',
      );
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(6); // Remove 'Basic ' prefix
    if (token !== DAIMO_PAY_WEBHOOK_SECRET) {
      console.warn('Daimo Pay webhook: Invalid webhook secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body first (must be done before any other operations)
    let rawPayload;
    try {
      // Clone the request to check body without consuming it
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();

      debug && console.log('Daimo Pay webhook body length:', bodyText.length);

      if (!bodyText || bodyText.trim() === '') {
        console.warn(
          'Daimo Pay webhook: Received empty body (possible duplicate/retry)',
        );
        // Return 200 to prevent retries
        return NextResponse.json(
          { acknowledged: true, message: 'Empty body - possible retry' },
          { status: 200 },
        );
      }

      rawPayload = await req.json();
      debug &&
        console.log('Daimo Pay webhook parsed payload:', {
          type: rawPayload?.type,
          paymentId: rawPayload?.paymentId,
        });
    } catch (parseError) {
      console.error('Daimo Pay webhook: JSON parse error:', parseError);
      // Return 200 to prevent retries
      return NextResponse.json(
        { acknowledged: true, error: 'Parse error - possible retry' },
        { status: 200 },
      );
    }

    if (!rawPayload || Object.keys(rawPayload).length === 0) {
      console.warn('Daimo Pay webhook: Empty payload object');
      return NextResponse.json(
        { error: 'Empty request payload' },
        { status: 400 },
      );
    }

    const payload = DaimoPayWebhookPayloadSchema.parse(rawPayload);

    // Check for idempotency key to prevent duplicate processing
    const idempotencyKey = req.headers.get('idempotency-key');
    if (idempotencyKey) {
      const existingEvent = await db.eventFeed.findFirst({
        where: { eventUuid: idempotencyKey },
      });

      if (existingEvent) {
        debug &&
          console.log(
            'Duplicate webhook event detected via idempotency key:',
            idempotencyKey,
          );
        return response({
          acknowledged: true,
          message: 'Event already processed',
          idempotencyKey,
        });
      }
    }

    debug &&
      console.log('Daimo Pay webhook received:', {
        type: payload.type,
        paymentId: payload.paymentId,
        isTestEvent: payload.isTestEvent,
        paymentStatus: payload.payment?.status,
        chainId: payload.chainId,
        txHash: payload.txHash,
      });

    // Skip processing test events (but acknowledge them)
    if (payload.isTestEvent) {
      debug &&
        console.log('Test event received, acknowledging without processing');
      return response({
        acknowledged: true,
        message: 'Test event acknowledged',
      });
    }

    // Validate required fields (already validated by Zod, but double-check for safety)
    if (!payload.paymentId) {
      throw new ApiParameterError('Missing paymentId in webhook payload');
    }

    if (!payload.payment?.id) {
      throw new ApiParameterError('Missing payment.id in webhook payload');
    }

    if (!payload.type) {
      throw new ApiParameterError('Missing type in webhook payload');
    }

    // Define payment include shape for type consistency
    const paymentInclude = {
      user: true,
      campaign: true,
    } satisfies Prisma.PaymentInclude;

    // Find or create payment based on event type
    let payment: PaymentWithIncludes | null = await db.payment.findFirst({
      where: {
        transactionHash: payload.paymentId,
      },
      include: paymentInclude,
    });

    // Create payment on payment_started if it doesn't exist
    if (!payment && payload.type === 'payment_started') {
      debug &&
        console.log(
          'Daimo Pay webhook: Creating payment from payment_started event',
          payload.paymentId,
        );

      // Extract metadata from Daimo payload
      const metadata = payload.payment.metadata;
      const campaignId = metadata?.campaignId
        ? parseInt(metadata.campaignId)
        : null;
      const userAddress = payload.payment.source?.payerAddress;
      const tipAmount = parseFloat(metadata?.tipAmount || '0');
      const baseAmount = parseFloat(metadata?.baseAmount || '0');
      const totalAmount = baseAmount + tipAmount;
      const isAnonymous = metadata?.anonymous === 'true';
      const userEmail = metadata?.email;

      if (!campaignId) {
        throw new ApiParameterError(
          'Missing campaignId in Daimo payment metadata',
        );
      }

      if (!userAddress) {
        throw new ApiParameterError(
          'Missing payer address in Daimo payment source',
        );
      }

      // Find or create user by address (normalized)
      let user = await db.user.findUnique({
        where: { address: userAddress.toLowerCase() },
      });

      if (!user) {
        // Create user if doesn't exist
        user = await db.user.create({
          data: {
            address: userAddress.toLowerCase(), // normalized address
            rawAddress: userAddress, // original case-sensitive address
            email: userEmail || null,
          },
        });
      }

      // Create payment record
      const createdPayment = await db.payment.create({
        data: {
          amount: totalAmount.toString(),
          token: 'USDT',
          type: 'BUY',
          status: 'confirming',
          transactionHash: payload.paymentId,
          provider: 'daimo',
          isAnonymous,
          userId: user.id,
          campaignId,
          metadata: {
            daimoPaymentId: payload.paymentId,
            pledgeAmount: baseAmount.toString(),
            tipAmount: tipAmount.toString(),
            userAddress,
            userEmail,
            createdViaWebhook: true,
            createdAt: new Date().toISOString(),
          },
        },
      });

      // Fetch the payment with includes
      payment = await db.payment.findUnique({
        where: { id: createdPayment.id },
        include: paymentInclude,
      });

      if (!payment) {
        throw new ApiParameterError('Failed to fetch created payment');
      }

      debug &&
        console.log('Daimo Pay webhook: Payment created:', {
          paymentId: payment.id,
          daimoPaymentId: payload.paymentId,
          amount: totalAmount,
        });
    }

    // Handle case where payment still doesn't exist (shouldn't happen for payment_started)
    if (!payment) {
      debug &&
        console.log(
          'Daimo Pay webhook: Payment not found and could not be created for',
          payload.paymentId,
        );

      // Return 409 Conflict to trigger Daimo's retry mechanism
      const retryAfter = payload.type === 'payment_started' ? '2' : '3';
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Payment not found and could not be created',
          retryable: true,
        },
        {
          status: 409,
          headers: { 'Retry-After': retryAfter },
        },
      );
    }

    // Map Daimo Pay status to our internal status
    const daimoStatus = payload.payment.status;
    let newStatus: string;

    switch (daimoStatus) {
      case 'payment_completed':
        newStatus = 'confirmed';
        break;
      case 'payment_bounced':
      case 'payment_refunded':
        newStatus = 'failed';
        break;
      case 'payment_started':
      default:
        newStatus = 'confirming';
        break;
    }

    // Define state transition hierarchy (higher = more final)
    const statusPriority: Record<string, number> = {
      confirming: 1, // Initial state
      confirmed: 2, // Terminal success state
      failed: 2, // Terminal failure state
    };

    const currentStatus = payment.status;
    const currentPriority = statusPriority[currentStatus] || 0;
    const newPriority = statusPriority[newStatus] || 0;

    // Prevent backward state transitions (webhooks arriving out of order)
    if (newPriority < currentPriority) {
      debug &&
        console.log(
          `Daimo Pay: Blocking state regression ${currentStatus} -> ${newStatus}`,
        );
      return response({
        acknowledged: true,
        paymentId: payment.id,
        daimoPaymentId: payload.paymentId,
        status: currentStatus,
        message: 'State transition blocked (out-of-order webhook)',
      });
    }

    // Prevent transitions between different terminal states (both priority === 2)
    if (
      currentPriority === 2 &&
      newPriority === 2 &&
      currentStatus !== newStatus
    ) {
      debug &&
        console.log(
          `Daimo Pay: Blocking terminal state flip ${currentStatus} -> ${newStatus}`,
        );
      return response({
        acknowledged: true,
        paymentId: payment.id,
        daimoPaymentId: payload.paymentId,
        status: currentStatus,
        message: 'State transition blocked (out-of-order webhook)',
      });
    }

    // Allow same-state updates (idempotency)
    if (currentStatus === newStatus) {
      debug && console.log('Daimo Pay: Idempotent update, status unchanged');
      return response({
        acknowledged: true,
        paymentId: payment.id,
        daimoPaymentId: payload.paymentId,
        status: currentStatus,
      });
    }

    // Prepare update data with comprehensive Daimo Pay metadata
    const baseUpdateData: Prisma.PaymentUpdateInput = {
      status: newStatus,
      provider: 'daimo',
    };

    // Store destination transaction hash (Daimo's delivery tx on Optimism)
    if (payload.payment.destination?.txHash) {
      baseUpdateData.transactionHash = payload.payment.destination.txHash;
    }

    // Build comprehensive metadata object
    const existingMetadata =
      (payment.metadata as Record<string, unknown>) || {};
    const daimoMetadata = {
      ...existingMetadata,
      // Payment processor identification
      paymentProcessor: 'daimo',
      daimoPaymentId: payload.paymentId,
      daimoEventType: payload.type,

      // Source transaction (what user actually paid)
      sourceChainId: payload.payment.source?.chainId,
      sourceToken: payload.payment.source?.tokenSymbol,
      sourceTokenAddress: payload.payment.source?.tokenAddress,
      sourceAmount: payload.payment.source?.amountUnits,
      sourceTxHash: payload.payment.source?.txHash,
      actualPayerAddress: payload.payment.source?.payerAddress,

      // Destination transaction (what was delivered to Celo)
      destinationChainId: payload.payment.destination?.chainId,
      destinationToken: payload.payment.destination?.tokenSymbol,
      destinationTokenAddress: payload.payment.destination?.tokenAddress,
      destinationAmount: payload.payment.destination?.amountUnits,
      destinationTxHash: payload.payment.destination?.txHash,
      destinationAddress: payload.payment.destination?.destinationAddress,

      // Payment display info
      displayValue: payload.payment.display?.paymentValue,
      displayCurrency: payload.payment.display?.currency,

      // Timestamps
      daimoCreatedAt: payload.payment.createdAt,
      webhookProcessedAt: new Date().toISOString(),
    };

    // Add refund information for payment_refunded events
    if (payload.type === 'payment_refunded' && 'refundAddress' in payload) {
      Object.assign(daimoMetadata, {
        refundAddress: payload.refundAddress,
        refundTokenAddress: payload.tokenAddress,
        refundAmountUnits: payload.amountUnits,
        refundChainId: payload.chainId,
        refundTxHash: payload.txHash,
      });
    }

    baseUpdateData.metadata = daimoMetadata as Prisma.InputJsonValue;

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: baseUpdateData,
      include: paymentInclude,
    });

    debug &&
      console.log(
        `Payment ${payment.id} status updated from ${currentStatus} to ${newStatus}`,
      );

    // If payment is confirmed, send notification (pledge already recorded via toCallData)
    // Only send notification if this is a new confirmation (not a duplicate event)
    if (
      newStatus === 'confirmed' &&
      currentStatus !== 'confirmed' &&
      payment.campaign.creatorAddress
    ) {
      try {
        const creator = await db.user.findUnique({
          where: { address: payment.campaign.creatorAddress },
        });

        if (creator) {
          const numericAmount = parseFloat(updatedPayment.amount);
          const formattedAmount = formatCrypto(
            numericAmount,
            updatedPayment.token,
          );
          const donorName = updatedPayment.isAnonymous
            ? 'anon'
            : getUserNameFromInstance(updatedPayment.user) ||
              updatedPayment.user?.address ||
              'unknown';

          await notify({
            receiverId: creator.id,
            creatorId: updatedPayment.userId,
            data: {
              type: 'CampaignPayment',
              campaignId: payment.campaignId,
              campaignTitle: payment.campaign.title,
              paymentId: updatedPayment.id,
              formattedAmount,
              donorName,
            },
            eventUuid: idempotencyKey || undefined,
          });

          debug &&
            console.log(
              `Notification sent for Daimo Pay payment ${updatedPayment.id}`,
            );
        }
      } catch (notificationError) {
        console.error(
          'Error sending Daimo Pay notification:',
          notificationError,
        );
      }
    }

    // Execute on-chain pledge for gateway payments
    // Only trigger when payment is newly confirmed (not duplicate events)
    if (
      newStatus === 'confirmed' &&
      currentStatus !== 'confirmed' &&
      payment.provider === 'daimo'
    ) {
      debug &&
        console.log(
          `Daimo Pay: Triggering pledge execution for payment ${payment.id}`,
        );

      // Fire-and-forget: don't await pledge execution
      // If execution fails, payment remains "confirmed" for manual retry
      Promise.resolve().then(async () => {
        try {
          const executionResult = await executeGatewayPledge(payment.id);

          debug &&
            console.log(
              `Daimo Pay: Pledge execution completed for payment ${payment.id}:`,
              executionResult,
            );
        } catch (executionError) {
          console.error(
            `Daimo Pay: Pledge execution error for payment ${payment.id}:`,
            executionError,
          );
        }
      });
    }

    debug &&
      console.log(
        `Payment ${payment.id} status updated to ${newStatus} via ${payload.type} event`,
      );

    return response({
      acknowledged: true,
      paymentId: payment.id,
      daimoPaymentId: payload.paymentId,
      eventType: payload.type,
      status: newStatus,
      previousStatus: currentStatus,
    });
  } catch (error: unknown) {
    console.error('Daimo Pay webhook error:', error);
    return handleError(error);
  }
}
