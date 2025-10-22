import { NextResponse } from 'next/server';
import { db, Prisma } from '@/server/db';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';
import { DAIMO_PAY_WEBHOOK_SECRET } from '@/lib/constant/server';
import { DaimoPayWebhookPayloadSchema } from '@/lib/api/types/webhooks';
import { debugApi as debug } from '@/lib/debug';

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

    console.log('═══════════════════════════════════════════════');
    console.log('🔍 DAIMO WEBHOOK: Starting payment lookup');
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 Search criteria:');
    console.log('🔍   Field: transactionHash');
    console.log('🔍   Value:', payload.paymentId);
    console.log('🔍   Type:', typeof payload.paymentId);
    console.log('🔍   Length:', payload.paymentId?.length);
    console.log('🔍 Daimo Pay webhook: IDENTIFIER MATCHING CHECK');
    console.log('🔍 Lookup key: transactionHash');
    console.log('🔍 Lookup value:', payload.paymentId);
    console.log(
      '🔍 Expected to find payment created by onPaymentStarted callback',
    );
    console.log('═══════════════════════════════════════════════');

    const payment = await db.payment.findFirst({
      where: {
        transactionHash: payload.paymentId,
      },
      include: {
        user: true,
        campaign: true,
      },
    });

    console.log('═══════════════════════════════════════════════');
    if (payment) {
      console.log('✅ DAIMO WEBHOOK: Payment FOUND');
      console.log('✅ Payment ID:', payment.id);
      console.log('✅ Stored transactionHash:', payment.transactionHash);
      console.log('✅ Current status:', payment.status);
      console.log('✅ Created at:', payment.createdAt);
    } else {
      console.error('🚨 DAIMO WEBHOOK: Payment NOT FOUND');
      console.error('🚨 Searched for transactionHash:', payload.paymentId);

      // Try to find ANY recent Daimo payments for debugging
      const recentDaimoPayments = await db.payment.findMany({
        where: {
          provider: 'daimo',
          createdAt: {
            gte: new Date(Date.now() - 60000), // Last 60 seconds
          },
        },
        select: {
          id: true,
          transactionHash: true,
          status: true,
          provider: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });

      console.error(
        '🔍 Recent Daimo payments (last 60s):',
        recentDaimoPayments.length > 0
          ? JSON.stringify(recentDaimoPayments, null, 2)
          : 'NONE FOUND',
      );

      // Try to find payments with similar transactionHash (in case of encoding issues)
      const similarPayments = await db.payment.findMany({
        where: {
          transactionHash: {
            contains: payload.paymentId.substring(0, 10), // First 10 chars
          },
        },
        select: {
          id: true,
          transactionHash: true,
          status: true,
          createdAt: true,
        },
        take: 3,
      });

      console.error(
        '🔍 Payments with similar transactionHash:',
        similarPayments.length > 0
          ? JSON.stringify(similarPayments, null, 2)
          : 'NONE FOUND',
      );
    }
    console.log('═══════════════════════════════════════════════');

    if (!payment) {
      console.error(
        '🚨 Daimo Pay webhook: Payment not found for paymentId:',
        payload.paymentId,
      );
      console.error('🚨 Event type:', payload.type);

      // For payment_started events, this is almost ALWAYS a race condition
      // The webhook arrives before/during database commit
      if (payload.type === 'payment_started') {
        console.warn('⚠️ payment_started webhook - RACE CONDITION DETECTED');
        console.warn('⚠️ Webhook arrived before payment creation completed');
        console.warn('⚠️ Returning 200 to acknowledge, Daimo will retry');
        return NextResponse.json(
          {
            acknowledged: true,
            message: 'Payment creation in progress - race condition',
            note: 'payment_started webhooks often arrive before DB commit',
            shouldRetry: true,
          },
          { status: 200 },
        );
      }

      // For other event types (completed, bounced, refunded)
      // If we see ANY recent payment_started events for this paymentId, it's a race condition
      console.warn('⚠️ Payment not found for non-started event');
      console.warn(
        '⚠️ This usually means payment creation is still in progress',
      );
      console.warn('⚠️ Treating as race condition - Daimo will retry');

      return NextResponse.json(
        {
          acknowledged: true,
          message: 'Payment creation in progress - race condition',
          note: `${payload.type} webhook arrived before payment exists in DB`,
          shouldRetry: true,
          eventType: payload.type,
        },
        { status: 200 },
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

    // Prevent status regression: don't change status from terminal states
    const currentStatus = payment.status;
    const terminalStates = ['confirmed', 'failed'];

    if (terminalStates.includes(currentStatus) && newStatus !== currentStatus) {
      debug &&
        console.log(
          `Ignoring status change from ${currentStatus} to ${newStatus} for payment ${payment.id}`,
        );
      return response({
        acknowledged: true,
        paymentId: payment.id,
        daimoPaymentId: payload.paymentId,
        eventType: payload.type,
        status: currentStatus,
        message: 'Event acknowledged but status not changed (already terminal)',
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
      sourceChainName:
        payload.payment.source?.chainId === '42220' ? 'Celo' : 'Unknown',
      sourceToken: payload.payment.source?.tokenSymbol,
      sourceTokenAddress: payload.payment.source?.tokenAddress,
      sourceAmount: payload.payment.source?.amountUnits,
      sourceTxHash: payload.payment.source?.txHash,
      actualPayerAddress: payload.payment.source?.payerAddress,

      // Destination transaction (what was delivered)
      destinationChainId: payload.payment.destination?.chainId,
      destinationChainName:
        payload.payment.destination?.chainId === '10' ? 'Optimism' : 'Unknown',
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
      include: {
        user: true,
        campaign: true,
      },
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
