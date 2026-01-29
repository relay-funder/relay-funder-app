import { NextResponse } from 'next/server';
import { db, Prisma } from '@/server/db';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';
import {
  DAIMO_PAY_WEBHOOK_SECRET,
  NEXT_PUBLIC_PLATFORM_ADMIN,
} from '@/lib/constant/server';
import { DaimoPayWebhookPayloadSchema } from '@/lib/api/types/webhooks';
import { executeGatewayPledgeWithBalanceRetry } from '@/lib/api/pledges/execute-with-balance-retry';
import { logFactory } from '@/lib/debug';
import {
  DAIMO_PAY_CHAIN_ID,
  DAIMO_PAY_USDT_ADDRESS,
  DAIMO_PAY_USDC_ADDRESS,
  DAIMO_PAY_MIN_AMOUNT,
} from '@/lib/constant/daimo';

// Type for payment with includes
type PaymentWithIncludes = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    campaign: true;
  };
}>;

/**
 * Validate Daimo payment amounts to prevent admin wallet drainage.
 *
 * Security: User-provided amounts (baseAmount + tipAmount) must match or be less than
 * the actual amount Daimo transferred to our wallet (destination.amountUnits).
 *
 * Prevents attack: User claims $100 donation (drains $100 from admin wallet in pledge)
 * but only sent $1 to Daimo (actual transfer).
 */
function validateDaimoPaymentAmounts(
  claimedBase: number,
  claimedTip: number,
  destinationAmountUnits: string | undefined,
  tokenSymbol: string | undefined,
  prefixId: string,
  logAddress: string,
): { valid: boolean; error?: string } {
  // Reject negative inputs for claimedBase and claimedTip
  if (claimedBase < 0) {
    return {
      valid: false,
      error: 'claimedBase must be non-negative',
    };
  }

  if (claimedTip < 0) {
    return {
      valid: false,
      error: 'claimedTip must be non-negative',
    };
  }

  const claimedTotal = claimedBase + claimedTip;

  // Require destination amount for validation
  if (!destinationAmountUnits) {
    logError('Missing destination.amountUnits for amount validation', {
      prefixId,
      logAddress,
      claimedBase,
      claimedTip,
      claimedTotal,
      note: 'Cannot validate without actual transfer amount',
    });
    return {
      valid: false,
      error: 'Missing destination amount - cannot validate payment',
    };
  }

  // Convert destination amount from token units (6 decimals) to USD
  let destinationAmountBigInt: bigint;
  try {
    // First try direct BigInt conversion (expected integer format)
    destinationAmountBigInt = BigInt(destinationAmountUnits);
  } catch (error) {
    try {
      // If direct conversion fails, try parsing as decimal and convert to token units
      const decimalAmount = parseFloat(destinationAmountUnits);
      if (isNaN(decimalAmount) || !isFinite(decimalAmount)) {
        throw new Error('Not a valid number');
      }
      // Convert decimal amount to token units (multiply by 10^6 for 6 decimals)
      destinationAmountBigInt = BigInt(Math.round(decimalAmount * 1_000_000));
    } catch (decimalError) {
      logError('Invalid destinationAmountUnits format - not a valid number', {
        prefixId,
        logAddress,
        destinationAmountUnits,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        decimalError:
          decimalError instanceof Error
            ? decimalError.message
            : 'Unknown decimal parsing error',
        note: 'Malformed destination amount units in Daimo webhook - tried both integer and decimal parsing',
      });
      return {
        valid: false,
        error: 'Invalid destination amount format - cannot validate payment',
      };
    }
  }
  const actualReceivedUSD = Number(destinationAmountBigInt) / 1_000_000; // 6 decimals

  // Tolerance for floating point precision: 0.01 USD (1 cent)
  const tolerance = 0.01;

  // Security check: Claimed total must not exceed actual received
  // Allow exact match or slight overpayment (user error), reject underpayment (attack)
  if (claimedTotal > actualReceivedUSD + tolerance) {
    logError('SECURITY: Claimed amount exceeds actual Daimo transfer', {
      prefixId,
      logAddress,
      claimedBase,
      claimedTip,
      claimedTotal,
      actualReceivedUSD,
      difference: claimedTotal - actualReceivedUSD,
      tokenSymbol,
      destinationAmountUnits,
      severity: 'CRITICAL',
      note: 'Potential admin wallet drainage attack prevented',
    });
    return {
      valid: false,
      error: `Amount mismatch: claimed ${claimedTotal} USD but received ${actualReceivedUSD} USD`,
    };
  }

  logVerbose('Amount validation passed', {
    prefixId,
    logAddress,
    claimedTotal,
    actualReceivedUSD,
    difference: actualReceivedUSD - claimedTotal,
    withinTolerance: true,
  });

  return { valid: true };
}

/**
 * Validate Daimo payment destination matches expected token and chain.
 * Prevents accepting payments in wrong tokens or on wrong chains.
 */
function validateDaimoDestination(
  destinationChainId: string | undefined,
  destinationTokenAddress: string | undefined,
  destinationTokenSymbol: string | undefined,
  prefixId: string,
  logAddress: string,
): { valid: boolean; error?: string } {
  // Require destination details
  if (!destinationChainId || !destinationTokenAddress) {
    logError('Missing destination chain or token information', {
      prefixId,
      logAddress,
      destinationChainId,
      destinationTokenAddress,
      destinationTokenSymbol,
    });
    return {
      valid: false,
      error: 'Missing destination chain or token information',
    };
  }

  // Validate chain is Celo
  const chainId = parseInt(destinationChainId);
  if (chainId !== DAIMO_PAY_CHAIN_ID) {
    logError('SECURITY: Wrong destination chain', {
      prefixId,
      logAddress,
      receivedChainId: chainId,
      expectedChainId: DAIMO_PAY_CHAIN_ID,
      severity: 'HIGH',
    });
    return {
      valid: false,
      error: `Invalid chain: expected ${DAIMO_PAY_CHAIN_ID} (Celo), got ${chainId}`,
    };
  }

  // Validate token is USDT or USDC (normalize addresses for comparison)
  const receivedToken = destinationTokenAddress.toLowerCase();
  const validTokens = [
    DAIMO_PAY_USDT_ADDRESS.toLowerCase(),
    DAIMO_PAY_USDC_ADDRESS.toLowerCase(),
  ];

  if (!validTokens.includes(receivedToken)) {
    logError('SECURITY: Wrong destination token', {
      prefixId,
      logAddress,
      receivedToken,
      expectedTokens: validTokens,
      receivedSymbol: destinationTokenSymbol,
      severity: 'HIGH',
    });
    return {
      valid: false,
      error: `Invalid token: expected USDT/USDC on Celo, got ${destinationTokenSymbol || receivedToken}`,
    };
  }

  logVerbose('Destination validation passed', {
    prefixId,
    logAddress,
    chainId,
    tokenAddress: receivedToken,
    tokenSymbol: destinationTokenSymbol,
  });

  return { valid: true };
}

const logVerbose = logFactory('verbose', '🚀 DaimoPayWebhook', {
  flag: 'daimo',
});

const logError = logFactory('error', '🚨 DaimoPayWebhook', { flag: 'daimo' });

const logWarn = logFactory('warn', '🚨 DaimoPayWebhook', { flag: 'daimo' });

export async function POST(req: Request) {
  let webhookEventId: number | null = null;
  // Track webhook processing time from the very start
  const webhookStartTime = Date.now();

  try {
    if (!NEXT_PUBLIC_PLATFORM_ADMIN) {
      logError('Missing NEXT_PUBLIC_PLATFORM_ADMIN configuration', {
        note: 'Daimo webhook requires admin address for gateway safety checks',
      });
      throw new ApiParameterError(
        'Server configuration error: NEXT_PUBLIC_PLATFORM_ADMIN is missing',
      );
    }

    const headers = Array.from(req.headers.entries())
      .filter(
        ([key]) =>
          ![
            'authorization',
            'cookie',
            'set-cookie',
            'x-forwarded-authorization',
          ].includes(key.toLowerCase()),
      )
      .map(([key, value]) =>
        key.toLowerCase() === 'authorization'
          ? [key, '[REDACTED]']
          : [key, value],
      );
    logVerbose('🎯 Webhook received:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(headers),
      receivedAt: new Date().toISOString(),
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
        // Return 500 to encourage retries from Daimo
        return NextResponse.json(
          { error: 'Empty body - retry expected' },
          { status: 500, headers: { 'Retry-After': '5' } },
        );
      }

      rawPayload = await req.json();
      logVerbose('Parsed payload:', {
        prefixId: rawPayload?.payment?.id,
        logAddress: rawPayload?.payment?.source?.payerAddress,
        type: rawPayload?.type,
        daimoPaymentId: rawPayload?.paymentId,
      });
    } catch (parseError) {
      logError('JSON parse error:', { error: parseError });
      // Return 500 to encourage retries from Daimo
      return NextResponse.json(
        { error: 'Parse error - retry expected' },
        { status: 500, headers: { 'Retry-After': '5' } },
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

    const logAddress = payload.payment.source?.payerAddress ?? '';
    const type = payload.type;
    let prefixId = payload.payment.id;
    const daimoNestedId = payload.payment.id; // Daimo's nested payment.id
    const daimoPaymentId = payload.paymentId;
    const daimoStatus = payload.payment.status;
    const chainId = payload.chainId;
    const txHash = payload.txHash;
    const isTestEvent = payload.isTestEvent;
    const idempotencyKey = req.headers.get('idempotency-key');

    // Persist webhook payload for audit/replay
    try {
      const createdEvent = await db.daimoWebhookEvent.create({
        data: {
          daimoPaymentId,
          daimoNestedId, // Daimo's nested payment.id (renamed from paymentId)
          eventType: type,
          paymentStatus: daimoStatus,
          idempotencyKey: idempotencyKey || undefined,
          payload: rawPayload as Prisma.InputJsonValue,
        },
        select: { id: true },
      });
      webhookEventId = createdEvent.id;
    } catch (eventCreateError) {
      logWarn('Failed to persist Daimo webhook event', {
        prefixId,
        logAddress,
        error:
          eventCreateError instanceof Error
            ? eventCreateError.message
            : 'Unknown error',
      });
    }

    const markWebhookEvent = async (
      status: 'SUCCESS' | 'FAILED' | 'SKIPPED',
      error?: string,
    ) => {
      if (!webhookEventId) {
        return;
      }

      try {
        await db.daimoWebhookEvent.update({
          where: { id: webhookEventId },
          data: {
            processingStatus: status,
            processingError: error,
            processedAt: new Date(),
          },
        });
      } catch (eventUpdateError) {
        logWarn('Failed to update Daimo webhook event status', {
          prefixId,
          logAddress,
          status,
          error:
            eventUpdateError instanceof Error
              ? eventUpdateError.message
              : 'Unknown error',
        });
      }
    };

    // Check for idempotency key to prevent duplicate processing
    if (idempotencyKey) {
      const existingEvent = await db.eventFeed.findFirst({
        where: { eventUuid: idempotencyKey },
      });

      if (existingEvent) {
        logVerbose('Duplicate webhook event detected via idempotency key:', {
          prefixId,
          logAddress,
          idempotencyKey,
        });
        await markWebhookEvent('SKIPPED', 'Duplicate webhook event');
        return response({
          acknowledged: true,
          message: 'Event already processed',
          idempotencyKey,
        });
      }
    }

    logVerbose('Daimo Pay webhook received:', {
      prefixId,
      logAddress,
      type,
      daimoNestedId,
      daimoPaymentId,
      isTestEvent,
      daimoStatus,
      chainId,
      txHash,
    });

    // Skip processing test events (but acknowledge them)
    if (payload.isTestEvent) {
      logVerbose('Test event received, acknowledging without processing', {
        prefixId,
        logAddress,
      });
      await markWebhookEvent('SKIPPED', 'Test event');
      return response({
        acknowledged: true,
        message: 'Test event acknowledged',
      });
    }

    // Validate required fields (already validated by Zod, but double-check for safety)
    if (!daimoPaymentId) {
      throw new ApiParameterError('Missing paymentId in webhook payload');
    }

    if (!daimoNestedId) {
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

    // Create payment on payment_started or payment_completed if it doesn't exist
    if (
      !dbPayment &&
      (payload.type === 'payment_started' ||
        payload.type === 'payment_completed')
    ) {
      logVerbose('Daimo Pay webhook: Creating payment from event', {
        prefixId,
        logAddress,
        daimoPaymentId,
        type,
      });

      // Extract metadata from Daimo payload
      const metadata = payload.payment.metadata;
      const campaignId = metadata?.campaignId
        ? parseInt(metadata.campaignId)
        : null;

      // Validate campaignId exists before database query
      if (!campaignId) {
        logError('Missing campaignId in Daimo payment metadata', {
          prefixId,
          logAddress,
          metadata,
          note: 'Cannot create payment without valid campaignId',
        });
        return NextResponse.json(
          { error: 'Missing campaignId in payment metadata' },
          { status: 400 },
        );
      }

      // Validate campaign exists BEFORE creating payment
      // Prevents cross-environment pollution (staging -> production)
      const campaign = await db.campaign.findUnique({
        where: { id: campaignId },
        select: {
          id: true,
          treasuryAddress: true,
          status: true,
        },
      });

      if (!campaign) {
        logWarn('Campaign not found - rejecting webhook', {
          prefixId,
          logAddress,
          campaignId,
          note: 'Prevents cross-environment payment creation',
        });
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 400 },
        );
      }

      // Validate campaign has treasury (required for pledge execution)
      if (!campaign.treasuryAddress) {
        logWarn('Campaign missing treasury address - rejecting webhook', {
          prefixId,
          logAddress,
          campaignId,
          campaignStatus: campaign.status,
        });
        return NextResponse.json(
          { error: 'Campaign treasury not configured' },
          { status: 400 },
        );
      }

      // Validate treasury address in metadata matches campaign
      const metadataTreasuryAddress = metadata?.treasuryAddress;
      if (!metadataTreasuryAddress) {
        logWarn('Missing treasury address in metadata - rejecting webhook', {
          prefixId,
          logAddress,
          campaignId,
          note: 'Treasury address required in metadata for validation',
        });
        return NextResponse.json(
          { error: 'Missing treasury address in metadata' },
          { status: 400 },
        );
      }

      if (
        metadataTreasuryAddress.toLowerCase() !==
        campaign.treasuryAddress?.toLowerCase()
      ) {
        logWarn('SECURITY: Treasury address mismatch in metadata', {
          prefixId,
          logAddress,
          campaignId,
          metadataTreasury: metadataTreasuryAddress,
          campaignTreasury: campaign.treasuryAddress,
          severity: 'HIGH',
          note: 'Metadata treasury address does not match campaign treasury',
        });
        return NextResponse.json(
          { error: 'Treasury address validation failed' },
          { status: 400 },
        );
      }

      const userAddress = payload.payment.source?.payerAddress;
      const tipAmount = parseFloat(metadata?.tipAmount || '0');
      const baseAmount = parseFloat(metadata?.baseAmount || '0');
      const totalAmount = baseAmount + tipAmount;
      const isAnonymous = metadata?.anonymous === 'true';
      const userEmail = metadata?.email;

      logVerbose(
        `Processing Daimo payment - Base: ${baseAmount}, Tip: ${tipAmount}, Total: ${totalAmount}`,
      );

      // Validate destination token and chain
      const destinationValidation = validateDaimoDestination(
        payload.payment.destination?.chainId,
        payload.payment.destination?.tokenAddress,
        payload.payment.destination?.tokenSymbol,
        prefixId,
        logAddress,
      );

      if (!destinationValidation.valid) {
        return NextResponse.json(
          { error: destinationValidation.error },
          { status: 400 },
        );
      }

      // Validate amounts against actual Daimo transfer
      const amountValidation = validateDaimoPaymentAmounts(
        baseAmount,
        tipAmount,
        payload.payment.destination?.amountUnits,
        payload.payment.destination?.tokenSymbol,
        prefixId,
        logAddress,
      );

      if (!amountValidation.valid) {
        return NextResponse.json(
          { error: amountValidation.error },
          { status: 400 },
        );
      }

      // Validate minimum amount
      if (totalAmount < DAIMO_PAY_MIN_AMOUNT) {
        logWarn('Payment below minimum amount', {
          prefixId,
          logAddress,
          totalAmount,
          minimumAmount: DAIMO_PAY_MIN_AMOUNT,
        });
        return NextResponse.json(
          {
            error: `Payment amount ${totalAmount} below minimum ${DAIMO_PAY_MIN_AMOUNT}`,
          },
          { status: 400 },
        );
      }

      if (!userAddress) {
        throw new ApiParameterError(
          'Missing payer address in Daimo payment source',
        );
      }

      // Find or create user by address (normalized)
      const normalizedUserAddress = userAddress.toLowerCase();
      let user = await db.user.findUnique({
        where: { address: normalizedUserAddress },
      });

      if (!user) {
        // Auto-create user for Daimo payments - user creation is just storing the wallet address
        // This allows donations from wallets that haven't explicitly signed in yet
        logVerbose('Auto-creating user for Daimo payment', {
          prefixId,
          logAddress,
          userAddress: normalizedUserAddress,
          note: 'User will be created with default roles',
        });

        try {
          user = await db.user.create({
            data: {
              address: normalizedUserAddress,
              rawAddress: userAddress,
              createdAt: new Date(),
              updatedAt: new Date(),
              roles: ['user'],
            },
          });

          logVerbose('User auto-created successfully', {
            prefixId,
            logAddress,
            userId: user.id,
            userAddress: normalizedUserAddress,
          });
        } catch (createError) {
          // Handle race condition - user might have been created by another request
          if (
            createError instanceof Prisma.PrismaClientKnownRequestError &&
            createError.code === 'P2002'
          ) {
            logVerbose('User creation race condition - fetching existing user', {
              prefixId,
              logAddress,
            });
            user = await db.user.findUnique({
              where: { address: normalizedUserAddress },
            });

            if (!user) {
              logError('User creation failed and user not found after race condition', {
                prefixId,
                logAddress,
                userAddress: normalizedUserAddress,
              });
              throw new ApiNotFoundError(
                `Failed to create or find user for address ${userAddress}`,
              );
            }
          } else {
            throw createError;
          }
        }
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
            tipAmount: tipAmount.toString(),
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

        logVerbose(
          `Daimo payment created - ID: ${createdPayment?.id}, Tip Amount: ${createdPayment?.tipAmount}`,
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          // Unique constraint violation - payment already exists
          logVerbose('Duplicate payment creation prevented by constraint', {
            prefixId,
            logAddress,
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
                prefixId,
                logAddress,
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

      // Link webhook event to internal payment for relational integrity
      // This runs for BOTH new payment creation AND P2002 duplicate path
      if (webhookEventId && dbPayment) {
        try {
          await db.daimoWebhookEvent.update({
            where: { id: webhookEventId },
            data: { internalPaymentId: dbPayment.id },
          });
        } catch (linkError) {
          logWarn('Failed to link webhook event to payment', {
            prefixId,
            logAddress,
            webhookEventId,
            paymentId: dbPayment.id,
            daimoPaymentId,
            error:
              linkError instanceof Error ? linkError.message : 'Unknown error',
          });
        }
      }

      logVerbose('Payment record created:', {
        prefixId,
        logAddress,
        dbPaymentId: dbPayment!.id,
        daimoPaymentId,
        amount: totalAmount,
        status: 'confirming',
        userAddress: userAddress,
        campaignId: campaignId,
        note: 'Waiting for Daimo to send funds to admin wallet',
      });
    }

    prefixId = `${prefixId}/${dbPayment?.id}`;

    // Handle case where payment still doesn't exist (shouldn't happen for payment events)
    if (!dbPayment) {
      logVerbose('Payment not found and could not be created for', {
        prefixId,
        logAddress,
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

    if (type === 'payment_bounced' || type === 'payment_refunded') {
      newStatus = 'failed';
    } else if (
      type === 'payment_completed' ||
      daimoStatus === 'payment_completed'
    ) {
      newStatus = 'confirmed';
    } else {
      newStatus = 'confirming';
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
        prefixId,
        logAddress,
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
          prefixId,
          logAddress,
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

    const isStatusChange = currentStatus !== newStatus;

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

    const paymentUpdateStartTime = Date.now();
    const updatedPayment = await db.payment.update({
      where: { id: dbPayment.id },
      data: baseUpdateData,
      include: paymentInclude,
    });
    const paymentUpdateDuration = Date.now() - paymentUpdateStartTime;

    logVerbose(
      `💾 Payment ${dbPayment.id} status updated from ${currentStatus} to ${newStatus}`,
      {
        prefixId,
        logAddress,
        duration: `${paymentUpdateDuration}ms`,
        timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
      },
    );

    if (
      newStatus === 'confirmed' &&
      isStatusChange &&
      dbPayment.campaign.creatorAddress
    ) {
      // Execute on-chain pledge, before any other blocking operations
      // This ensures pledge execution starts immediately after payment confirmation
      if (dbPayment.provider === 'daimo') {
        const pledgeLaunchTime = Date.now();
        const timeSinceWebhookStart = pledgeLaunchTime - webhookStartTime;

        logVerbose('🚀 PRIORITY: Queuing pledge execution IMMEDIATELY:', {
          prefixId,
          logAddress,
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
          queuedAt: new Date().toISOString(),
          timeSinceWebhookStart: `${timeSinceWebhookStart}ms`,
          metadata: {
            tipAmount: (dbPayment.metadata as Record<string, unknown>)
              ?.tipAmount,
            baseAmount: (dbPayment.metadata as Record<string, unknown>)
              ?.baseAmount,
          },
        });

        // Fire-and-forget: don't await pledge execution
        // Launch IMMEDIATELY before notifications and round contributions
        // If execution fails, payment remains "confirmed" for manual retry
        //
        // IMPORTANT: Uses executeGatewayPledgeWithBalanceRetry to handle the timing
        // issue where Daimo's webhook fires before on-chain transfer is confirmed.
        // The function will:
        // 1. Wait for Daimo's destination tx to be confirmed (if hash provided)
        // 2. Retry with exponential backoff if balance is insufficient
        const destinationTxHash = payload.payment.destination?.txHash;
        const destinationAddress =
          payload.payment.destination?.destinationAddress || '';

        if (!destinationAddress) {
          logWarn(
            'Daimo payload missing destinationAddress - safety check skipped',
            {
              prefixId,
              logAddress,
              dbPaymentId: dbPayment.id,
              destinationTxHash: destinationTxHash || 'not available',
            },
          );
        }

        // Safety: the gateway flow assumes Daimo delivers funds to the platform admin wallet
        // and ONLY THEN do we pledge into the campaign treasury. If Daimo delivers to some
        // other address (e.g. the treasury), executing the gateway pledge would drain the
        // admin wallet and/or double-fund the treasury.
        if (
          destinationAddress &&
          NEXT_PUBLIC_PLATFORM_ADMIN &&
          destinationAddress.toLowerCase() !==
            NEXT_PUBLIC_PLATFORM_ADMIN.toLowerCase()
        ) {
          const errorMessage = `Daimo destinationAddress mismatch: expected ${NEXT_PUBLIC_PLATFORM_ADMIN}, got ${destinationAddress}`;

          logError('🚨 Skipping gateway pledge: destination address mismatch', {
            prefixId,
            logAddress,
            dbPaymentId: dbPayment.id,
            daimoPaymentId: payload.paymentId,
            destinationTxHash: destinationTxHash || 'not available',
            destinationAddress,
            expectedDestinationAddress: NEXT_PUBLIC_PLATFORM_ADMIN,
            note: 'This indicates Daimo delivered funds somewhere other than the admin wallet (e.g. treasury).',
          });

          // Persist failure state for visibility in the admin UI (do not override SUCCESS).
          await db.payment.updateMany({
            where: {
              id: dbPayment.id,
              pledgeExecutionStatus: { in: ['NOT_STARTED', 'FAILED'] },
            },
            data: {
              pledgeExecutionStatus: 'FAILED',
              pledgeExecutionError: errorMessage,
              pledgeExecutionAttempts: { increment: 1 },
              pledgeExecutionLastAttempt: new Date(),
            },
          });
        } else {
          Promise.resolve().then(async () => {
            const promiseStartTime = Date.now();
            const delayFromQueue = promiseStartTime - pledgeLaunchTime;
            const delayFromWebhookStart = promiseStartTime - webhookStartTime;

            try {
              logVerbose(
                `⚡ PLEDGE EXECUTION STARTING for payment ${dbPayment.id}`,
                {
                  prefixId,
                  logAddress,
                  startedAt: new Date().toISOString(),
                  delayFromQueue: `${delayFromQueue}ms`,
                  delayFromWebhookStart: `${delayFromWebhookStart}ms`,
                  destinationTxHash: destinationTxHash || 'not available',
                },
              );

              const executionResult =
                await executeGatewayPledgeWithBalanceRetry(
                  dbPayment.id,
                  destinationTxHash,
                  undefined, // Use default retry config
                  { prefixId, logAddress },
                );

              const executionDuration = Date.now() - promiseStartTime;
              const totalTimeFromWebhook = Date.now() - webhookStartTime;

              // Check if execution succeeded or failed
              if (executionResult.success) {
                logVerbose(
                  `✅ Pledge execution SUCCESS for payment ${dbPayment.id}:`,
                  {
                    prefixId,
                    logAddress,
                    executionDuration: `${executionDuration}ms`,
                    delayFromQueue: `${delayFromQueue}ms`,
                    totalTimeFromWebhook: `${totalTimeFromWebhook}ms`,
                    completedAt: new Date().toISOString(),
                    ...executionResult,
                  },
                );
              } else {
                // Execution failed but was handled gracefully (FAILED status persisted)
                logError(
                  `❌ Pledge execution FAILED (handled) for payment ${dbPayment.id}:`,
                  {
                    prefixId,
                    logAddress,
                    executionDuration: `${executionDuration}ms`,
                    delayFromQueue: `${delayFromQueue}ms`,
                    totalTimeFromWebhook: `${totalTimeFromWebhook}ms`,
                    failedAt: new Date().toISOString(),
                    error: executionResult.error || 'Unknown error',
                    dbPaymentId: dbPayment.id,
                    daimoPaymentId: payload.paymentId,
                    campaignId: dbPayment.campaign.id,
                    treasuryAddress: dbPayment.campaign.treasuryAddress,
                    note: 'FAILED status persisted in database',
                  },
                );
              }
            } catch (executionError) {
              // Unexpected error (should rarely happen now)
              const executionDuration = Date.now() - promiseStartTime;
              const totalTimeFromWebhook = Date.now() - webhookStartTime;

              logError(
                `❌ Pledge execution CRASHED (unexpected) for payment ${dbPayment.id}:`,
                {
                  prefixId,
                  logAddress,
                  executionDuration: `${executionDuration}ms`,
                  delayFromQueue: `${delayFromQueue}ms`,
                  totalTimeFromWebhook: `${totalTimeFromWebhook}ms`,
                  failedAt: new Date().toISOString(),
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
                  note: 'Unexpected error - database state may be inconsistent',
                },
              );
            }
          });
        }
      }

      // If payment is confirmed
      // 1. Check if the campaign has a creator address
      // 2. Send notification if the campaign has a creator address
      // 3. Create round contributions for confirmed payments
      // Note: Pledge execution now happens BEFORE these operations

      // 1. Check if the campaign has a creator address
      if (dbPayment.campaign.creatorAddress) {
        // 2. Send notification if the campaign has a creator address (pledge already recorded via toCallData)
        // Only send notification if this is a new confirmation (not a duplicate event)

        const notificationStartTime = Date.now();
        logVerbose('📧 Starting notification processing:', {
          prefixId,
          logAddress,
          newStatus,
          currentStatus,
          creatorAddress: dbPayment.campaign.creatorAddress,
          timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
        });

        try {
          const creatorLookupStart = Date.now();
          const creator = await db.user.findUnique({
            where: { address: dbPayment.campaign.creatorAddress },
          });
          const creatorLookupDuration = Date.now() - creatorLookupStart;

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

            const notifySendStart = Date.now();
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
            const notifySendDuration = Date.now() - notifySendStart;
            const totalNotificationDuration =
              Date.now() - notificationStartTime;

            logVerbose(
              `✅ Notification sent for Daimo Pay payment ${updatedPayment.id}`,
              {
                prefixId,
                logAddress,
                creatorLookupDuration: `${creatorLookupDuration}ms`,
                notifySendDuration: `${notifySendDuration}ms`,
                totalNotificationDuration: `${totalNotificationDuration}ms`,
                timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
              },
            );
          } else {
            logVerbose('⚠️ Creator not found for notification', {
              prefixId,
              logAddress,
              creatorAddress: dbPayment.campaign.creatorAddress,
              creatorLookupDuration: `${creatorLookupDuration}ms`,
            });
          }
        } catch (notificationError) {
          const notificationDuration = Date.now() - notificationStartTime;
          logError('❌ Error sending Daimo Pay notification:', {
            prefixId,
            logAddress,
            error: notificationError,
            notificationDuration: `${notificationDuration}ms`,
            timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
          });
        }
      }

      // 3. Create round contributions for confirmed payments
      if (dbPayment.provider === 'daimo') {
        // This associates payments with rounds immediately when confirmed
        const roundsStartTime = Date.now();

        logVerbose('🎯 Starting round contributions processing:', {
          prefixId,
          logAddress,
          newStatus,
          currentStatus,
          provider: dbPayment.provider,
          dbPaymentId: dbPayment.id,
          campaignId: dbPayment.campaign.id,
          timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
        });

        try {
          // Find all approved round participations for this campaign
          // Match the logic from direct wallet payments exactly for consistency
          const roundQueryStart = Date.now();
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
          const roundQueryDuration = Date.now() - roundQueryStart;

          logVerbose(
            `📊 Found ${roundCampaigns.length} approved round participations for campaign ${dbPayment.campaign.id}`,
            {
              prefixId,
              logAddress,
              roundQueryDuration: `${roundQueryDuration}ms`,
              timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
            },
          );

          // Create RoundContribution records for each approved round
          let contributionsCreated = 0;
          let contributionsFailed = 0;

          for (const roundCampaign of roundCampaigns) {
            const contributionStart = Date.now();
            try {
              await db.roundContribution.create({
                data: {
                  campaignId: dbPayment.campaign.id,
                  roundCampaignId: roundCampaign.id,
                  paymentId: dbPayment.id,
                  humanityScore: dbPayment.user.humanityScore, // Use user's persistent humanity score
                },
              });
              const contributionDuration = Date.now() - contributionStart;
              contributionsCreated++;

              logVerbose('✅ Created RoundContribution:', {
                prefixId,
                logAddress,
                dbPaymentId: dbPayment.id,
                roundId: roundCampaign.roundId,
                roundTitle: roundCampaign.Round.title,
                humanityScore: dbPayment.user.humanityScore,
                contributionDuration: `${contributionDuration}ms`,
              });
            } catch (roundError) {
              const contributionDuration = Date.now() - contributionStart;
              contributionsFailed++;

              logError(
                `❌ Failed to create round contribution for round ${roundCampaign.roundId}:`,
                {
                  prefixId,
                  logAddress,
                  error: roundError,
                  contributionDuration: `${contributionDuration}ms`,
                },
              );
              // Continue with other rounds even if one fails
            }
          }

          const totalRoundsDuration = Date.now() - roundsStartTime;
          logVerbose('✅ Round contributions processing complete:', {
            prefixId,
            logAddress,
            contributionsCreated,
            contributionsFailed,
            totalRoundsDuration: `${totalRoundsDuration}ms`,
            timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
          });
        } catch (roundQueryError) {
          const roundsDuration = Date.now() - roundsStartTime;
          logError('❌ Error querying round participations:', {
            prefixId,
            logAddress,
            error: roundQueryError,
            roundsDuration: `${roundsDuration}ms`,
            timeSinceWebhookStart: `${Date.now() - webhookStartTime}ms`,
          });
          // Don't fail the payment confirmation if round association fails
        }
      }
    }

    const totalWebhookDuration = Date.now() - webhookStartTime;

    logVerbose(`🏁 Webhook processing complete for payment ${dbPayment.id}`, {
      prefixId,
      logAddress,
      newStatus,
      previousStatus: currentStatus,
      eventType: payload.type,
      totalWebhookDuration: `${totalWebhookDuration}ms`,
      completedAt: new Date().toISOString(),
    });

    await markWebhookEvent('SUCCESS');

    return response({
      acknowledged: true,
      paymentId: dbPayment.id,
      daimoPaymentId: payload.paymentId,
      eventType: payload.type,
      status: newStatus,
      previousStatus: currentStatus,
    });
  } catch (error: unknown) {
    if (webhookEventId) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      try {
        await db.daimoWebhookEvent.update({
          where: { id: webhookEventId },
          data: {
            processingStatus: 'FAILED',
            processingError: errorMessage,
            processedAt: new Date(),
          },
        });
      } catch (eventUpdateError) {
        logWarn('Failed to update Daimo webhook event on error', {
          error:
            eventUpdateError instanceof Error
              ? eventUpdateError.message
              : 'Unknown error',
        });
      }
    }
    logError('Daimo Pay webhook error:', { error });
    return handleError(error);
  }
}
