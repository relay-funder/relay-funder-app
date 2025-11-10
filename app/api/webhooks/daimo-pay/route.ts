import { NextResponse } from 'next/server';
import { db, Prisma } from '@/server/db';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';
import { DAIMO_PAY_WEBHOOK_SECRET } from '@/lib/constant/server';
import { DaimoPayWebhookPayloadSchema } from '@/lib/api/types/webhooks';
import { executeGatewayPledge } from '@/lib/api/pledges/execute-gateway-pledge';
import { log, LogType } from '@/lib/debug';

// Type for payment with includes
type PaymentWithIncludes = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    campaign: true;
  };
}>;

const logFactory = (type: LogType, prefix: string) => {
  return (
    message: string,
    dataObj?: Record<string, unknown>,
    ...args: unknown[]
  ) => {
    const { id, address, ...restData } = dataObj ?? {};
    const data = Object.keys(restData).length > 0 ? restData : undefined;
    log(
      message,
      {
        type,
        user: address as string | undefined, // used for verbose logging permission checks in production
        data,
        prefix: `${prefix}${id ? ` (${id})` : ''}`,
      },
      ...args,
    );
  };
};

const logVerbose = logFactory('verbose', '🚀 DaimoPayWebhook');

const logError = logFactory('error', '🚨 DaimoPayWebhook');

const logWarn = logFactory('warn', '🚨 DaimoPayWebhook');

export async function POST(req: Request) {
  try {
    logVerbose('Webhook called:', {
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
      logWarn('Missing or invalid Authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(6); // Remove 'Basic ' prefix
    if (token !== DAIMO_PAY_WEBHOOK_SECRET) {
      logWarn('Invalid webhook secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body first (must be done before any other operations)
    let rawPayload;
    try {
      // Clone the request to check body without consuming it
      const clonedReq = req.clone();
      const bodyText = await clonedReq.text();

      logVerbose('Daimo Pay webhook body length:', { length: bodyText.length });

      if (!bodyText || bodyText.trim() === '') {
        logWarn('Received empty body (possible duplicate/retry)');
        // Return 200 to prevent retries
        return NextResponse.json(
          { acknowledged: true, message: 'Empty body - possible retry' },
          { status: 200 },
        );
      }

      rawPayload = await req.json();
      logVerbose('Parsed payload:', {
        id: rawPayload?.payment?.id,
        address: rawPayload?.payment?.source?.payerAddress,
        type: rawPayload?.type,
        daimoPaymentId: rawPayload?.paymentId,
      });
    } catch (parseError) {
      logError('JSON parse error:', { error: parseError });
      // Return 200 to prevent retries
      return NextResponse.json(
        { acknowledged: true, error: 'Parse error - possible retry' },
        { status: 200 },
      );
    }

    if (!rawPayload || Object.keys(rawPayload).length === 0) {
      logWarn('Empty payload object');
      return NextResponse.json(
        { error: 'Empty request payload' },
        { status: 400 },
      );
    }

    const payload = DaimoPayWebhookPayloadSchema.parse(rawPayload);

    const address = payload.payment.source?.payerAddress ?? '';
    const type = payload.type;
    const id = payload.payment.id;
    const paymentId = payload.payment.id;
    const daimoPaymentId = payload.paymentId;
    const daimoStatus = payload.payment.status;
    const chainId = payload.chainId;
    const txHash = payload.txHash;
    const isTestEvent = payload.isTestEvent;
    const idempotencyKey = req.headers.get('idempotency-key');

    // Check for idempotency key to prevent duplicate processing
    if (idempotencyKey) {
      const existingEvent = await db.eventFeed.findFirst({
        where: { eventUuid: idempotencyKey },
      });

      if (existingEvent) {
        logVerbose('Duplicate webhook event detected via idempotency key:', {
          id,
          address,
          idempotencyKey,
        });
        return response({
          acknowledged: true,
          message: 'Event already processed',
          idempotencyKey,
        });
      }
    }

    logVerbose('Daimo Pay webhook received:', {
      id,
      address,
      type,
      paymentId,
      daimoPaymentId,
      isTestEvent,
      daimoStatus,
      chainId,
      txHash,
    });

    // Skip processing test events (but acknowledge them)
    if (payload.isTestEvent) {
      logVerbose('Test event received, acknowledging without processing', {
        id,
        address,
      });
      return response({
        acknowledged: true,
        message: 'Test event acknowledged',
      });
    }

    // Validate required fields (already validated by Zod, but double-check for safety)
    if (!daimoPaymentId) {
      throw new ApiParameterError('Missing paymentId in webhook payload');
    }

    if (!paymentId) {
      throw new ApiParameterError('Missing payment.id in webhook payload');
    }

    if (!type) {
      throw new ApiParameterError('Missing type in webhook payload');
    }

    // Define payment include shape for type consistency
    const paymentInclude = {
      user: true,
      campaign: true,
    } satisfies Prisma.PaymentInclude;

    // Find or create payment based on event type
    let dbPayment: PaymentWithIncludes | null = await db.payment.findFirst({
      where: {
        daimoPaymentId: payload.paymentId,
      },
      include: paymentInclude,
    });

    // Create payment on payment_started if it doesn't exist
    if (!dbPayment && payload.type === 'payment_started') {
      logVerbose(
        'Daimo Pay webhook: Creating payment from payment_started event',
        {
          id,
          address,
          daimoPaymentId,
        },
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

      // Find user by address (normalized)
      const user = await db.user.findUnique({
        where: { address: userAddress.toLowerCase() },
      });

      if (!user) {
        throw new ApiNotFoundError(
          `User not found for address ${userAddress}. User must exist before making payments.`,
        );
      }

      // Create payment record
      // IMPORTANT: Store only the base pledge amount (not including tip) to match direct wallet flow
      // Tip is stored separately in metadata and handled by smart contract
      let createdPayment:
        | Awaited<ReturnType<typeof db.payment.create>>
        | undefined;
      try {
        createdPayment = await db.payment.create({
          data: {
            amount: baseAmount.toString(), // Pledge amount only
            token: 'USDT',
            type: 'BUY',
            status: 'confirming',
            daimoPaymentId: payload.paymentId,
            provider: 'daimo',
            isAnonymous,
            userId: user.id,
            campaignId,
            metadata: {
              daimoPaymentId: payload.paymentId,
              pledgeAmount: baseAmount.toString(),
              tipAmount: tipAmount.toString(),
              totalReceivedFromDaimo: totalAmount.toString(), // Track total for reconciliation
              userAddress,
              userEmail,
              createdViaWebhook: true,
              createdAt: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          // Unique constraint violation - payment already exists
          logVerbose('Duplicate payment creation prevented by constraint', {
            id,
            address,
          });
          dbPayment = await db.payment.findFirst({
            where: { daimoPaymentId },
            include: paymentInclude,
          });

          // Verify payment was found (should exist if constraint was violated)
          if (!dbPayment) {
            logError(
              'Daimo Pay: Unique constraint violated but payment not found',
              {
                id,
                daimoPaymentId,
                error: error.message,
              },
            );
            throw new ApiParameterError(
              `Payment with Daimo payment ID ${daimoPaymentId} should exist but was not found`,
            );
          }
        } else {
          throw error;
        }
      }

      // Fetch the payment with includes (only if payment creation succeeded)
      if (createdPayment) {
        dbPayment = await db.payment.findUnique({
          where: { id: createdPayment.id },
          include: paymentInclude,
        });

        if (!dbPayment) {
          throw new ApiParameterError('Failed to fetch created payment');
        }
      }

      logVerbose('Payment record created:', {
        id,
        address,
        dbPaymentId: dbPayment!.id,
        daimoPaymentId,
        amount: totalAmount,
        status: 'confirming',
        userAddress: userAddress,
        campaignId: campaignId,
        note: 'Waiting for Daimo to send funds to admin wallet',
      });
    }

    // Handle case where payment still doesn't exist (shouldn't happen for payment_started)
    if (!dbPayment) {
      logVerbose('Payment not found and could not be created for', {
        id,
        address,
        daimoPaymentId,
      });

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

    const currentStatus = dbPayment.status;
    const currentPriority = statusPriority[currentStatus] || 0;
    const newPriority = statusPriority[newStatus] || 0;

    // Prevent backward state transitions (webhooks arriving out of order)
    if (newPriority < currentPriority) {
      logVerbose(`Blocking state regression ${currentStatus} -> ${newStatus}`, {
        id,
        address,
      });

      return response({
        acknowledged: true,
        paymentId: dbPayment.id,
        daimoPaymentId,
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
      logVerbose(
        `Blocking terminal state flip ${currentStatus} -> ${newStatus}`,
        {
          id,
          address,
        },
      );
      return response({
        acknowledged: true,
        paymentId: dbPayment.id,
        daimoPaymentId,
        status: currentStatus,
        message: 'State transition blocked (out-of-order webhook)',
      });
    }

    // Allow same-state updates (idempotency)
    if (currentStatus === newStatus) {
      logVerbose('Idempotent update, status unchanged', {
        id,
        address,
      });
      return response({
        acknowledged: true,
        paymentId: dbPayment.id,
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
      (dbPayment.metadata as Record<string, unknown>) || {};
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
    if (type === 'payment_refunded' && 'refundAddress' in payload) {
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
      where: { id: dbPayment.id },
      data: baseUpdateData,
      include: paymentInclude,
    });

    logVerbose(
      `Payment ${dbPayment.id} status updated from ${currentStatus} to ${newStatus}`,
      {
        id,
        address,
      },
    );

    if (
      newStatus === 'confirmed' &&
      currentStatus !== 'confirmed' &&
      dbPayment.campaign.creatorAddress
    ) {
      // If payment is confirmed
      // 1. Check if the campaign has a creator address
      // 2. Send notification if the campaign has a creator address
      // 3. Check if payment provider is Daimo
      // 4. Create round contributions for confirmed payments
      // 5. Execute on-chain pledge for gateway payments

      // 1. Check if the campaign has a creator address
      if (dbPayment.campaign.creatorAddress) {
        // 2. Send notification if the campaign has a creator address (pledge already recorded via toCallData)
        // Only send notification if this is a new confirmation (not a duplicate event)

        logVerbose('Sending notification for confirmed payment:', {
          id,
          address,
          newStatus,
          currentStatus,
          creatorAddress: dbPayment.campaign.creatorAddress,
        });
        try {
          const creator = await db.user.findUnique({
            where: { address: dbPayment.campaign.creatorAddress },
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
                campaignId: dbPayment.campaignId,
                campaignTitle: dbPayment.campaign.title,
                paymentId: updatedPayment.id,
                formattedAmount,
                donorName,
              },
              eventUuid: idempotencyKey || undefined,
            });

            logVerbose(
              `Notification sent for Daimo Pay payment ${updatedPayment.id}`,
              {
                id,
                address,
              },
            );
          }
        } catch (notificationError) {
          logError('Error sending Daimo Pay notification:', {
            id,
            error: notificationError,
          });
        }
      }

      // 3. Check if payment provider is Daimo
      if (dbPayment.provider === 'daimo') {
        // 4. Create round contributions for confirmed payments
        // This associates payments with rounds immediately when confirmed
        logVerbose('Creating round contributions for confirmed payment:', {
          id,
          address,
          newStatus,
          currentStatus,
          provider: dbPayment.provider,
          dbPaymentId: dbPayment.id,
          campaignId: dbPayment.campaign.id,
        });

        try {
          // Find all approved round participations for this campaign
          // Match the logic from direct wallet payments exactly for consistency
          const roundCampaigns = await db.roundCampaigns.findMany({
            where: {
              campaignId: dbPayment.campaign.id,
              status: 'APPROVED', // RoundCampaign must be APPROVED
              Round: {
                startDate: { lte: new Date() }, // Round has started
                endDate: { gte: new Date() }, // Round hasn't ended
              },
            },
            include: {
              Round: true,
            },
          });

          logVerbose(
            `Found ${roundCampaigns.length} approved round participations for campaign ${dbPayment.campaign.id}`,
            {
              id,
              address,
            },
          );

          // Create RoundContribution records for each approved round
          for (const roundCampaign of roundCampaigns) {
            try {
              await db.roundContribution.create({
                data: {
                  campaignId: dbPayment.campaign.id,
                  roundCampaignId: roundCampaign.id,
                  paymentId: dbPayment.id,
                  humanityScore: dbPayment.user.humanityScore, // Use user's persistent humanity score
                },
              });

              logVerbose('Created RoundContribution:', {
                id,
                address,
                dbPaymentId: dbPayment.id,
                roundId: roundCampaign.roundId,
                roundTitle: roundCampaign.Round.title,
                humanityScore: dbPayment.user.humanityScore,
              });
            } catch (roundError) {
              logError(
                `[Daimo Webhook] Failed to create round contribution for round ${roundCampaign.roundId}:`,
                { id, address, error: roundError },
              );
              // Continue with other rounds even if one fails
            }
          }
        } catch (roundQueryError) {
          logError('Error querying round participations:', {
            id,
            address,
            error: roundQueryError,
          });
          // Don't fail the payment confirmation if round association fails
        }

        // Execute on-chain pledge for gateway payments
        // Only trigger when payment is newly confirmed (not duplicate events)
        logVerbose('Triggering pledge execution:', {
          id,
          address,
          newStatus,
          currentStatus,
          provider: dbPayment.provider,
          dbPaymentId: dbPayment.id,
          daimoPaymentId: payload.paymentId,
          amount: dbPayment.amount,
          token: dbPayment.token,
          userAddress: dbPayment.user.address,
          campaignId: dbPayment.campaign.id,
          campaignTitle: dbPayment.campaign.title,
          treasuryAddress: dbPayment.campaign.treasuryAddress,
          timestamp: new Date().toISOString(),
          metadata: {
            tipAmount: (dbPayment.metadata as Record<string, unknown>)
              ?.tipAmount,
            baseAmount: (dbPayment.metadata as Record<string, unknown>)
              ?.baseAmount,
          },
        });

        // Fire-and-forget: don't await pledge execution
        // If execution fails, payment remains "confirmed" for manual retry
        Promise.resolve().then(async () => {
          const executionStartTime = Date.now();
          try {
            logVerbose(
              `Starting pledge execution for payment ${dbPayment.id}`,
              {
                id,
                address,
              },
            );

            const executionResult = await executeGatewayPledge(dbPayment.id, {
              id,
              address,
            });

            const executionDuration = Date.now() - executionStartTime;
            logVerbose(
              `Pledge execution SUCCESS for payment ${dbPayment.id}:`,
              {
                id,
                address,
                duration: `${executionDuration}ms`,
                ...executionResult,
              },
            );
          } catch (executionError) {
            const executionDuration = Date.now() - executionStartTime;
            logError(`Pledge execution FAILED for payment ${dbPayment.id}:`, {
              id,
              duration: `${executionDuration}ms`,
              error:
                executionError instanceof Error
                  ? executionError.message
                  : 'Unknown error',
              errorStack:
                executionError instanceof Error
                  ? executionError.stack
                  : undefined,
              dbPaymentId: dbPayment.id,
              daimoPaymentId: payload.paymentId,
              campaignId: dbPayment.campaign.id,
              treasuryAddress: dbPayment.campaign.treasuryAddress,
            });
          }
        });
      }
    }

    logVerbose(
      `Payment ${dbPayment.id} status updated to ${newStatus} via ${payload.type} event`,
      { id, address },
    );

    return response({
      acknowledged: true,
      paymentId: dbPayment.id,
      daimoPaymentId: payload.paymentId,
      eventType: payload.type,
      status: newStatus,
      previousStatus: currentStatus,
    });
  } catch (error: unknown) {
    logError('Daimo Pay webhook error:', { error });
    return handleError(error);
  }
}
