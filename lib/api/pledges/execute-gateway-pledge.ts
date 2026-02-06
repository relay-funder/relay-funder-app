import { db, type Prisma } from '@/server/db';
import { ApiParameterError, ApiUpstreamError } from '@/lib/api/error';
import { ethers, erc20Abi } from '@/lib/web3';
import { keccak256, encodePacked } from 'viem';
import { computeDeterministicPledgeId } from '@/lib/web3/pledge-id';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { USD_ADDRESS, USD_DECIMALS } from '@/lib/constant';
import {
  NEXT_PUBLIC_PLATFORM_ADMIN,
  PLATFORM_ADMIN_PRIVATE_KEY,
  NEXT_PUBLIC_RPC_URL,
} from '@/lib/constant/server';
import type {
  ExecuteGatewayPledgeResponse,
  GatewayPledgeMetadata,
} from '@/lib/api/types/pledges';
import { logFactory } from '@/lib/debug';
import { withExecutionLock } from '@/lib/api/pledges/execution-lock';
import {
  waitWithTimeout,
  TIMEOUT_VALUES,
} from '@/lib/web3/transaction-timeout';
import { waitForTransactionWithPolling } from '@/lib/web3/transaction-polling';

const logVerbose = logFactory('verbose', '🚀 DaimoPledge', { flag: 'daimo' });

const logError = logFactory('error', '🚨 DaimoPledge', { flag: 'daimo' });

/** Selector for KeepWhatsRaisedPledgeAlreadyProcessed(bytes32) custom error */
const PLEDGE_ALREADY_PROCESSED_SELECTOR = '0x7c730b08';
const PLEDGE_ALREADY_PROCESSED_ERROR_NAME =
  'KeepWhatsRaisedPledgeAlreadyProcessed';

const keepWhatsRaisedInterface = new ethers.Interface(KeepWhatsRaisedABI);

function isHexData(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!value.startsWith('0x')) return false;
  if (value.length < 10) return false; // 4-byte selector + 0x

  for (let i = 2; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    const isHexDigit =
      (charCode >= 48 && charCode <= 57) || // 0-9
      (charCode >= 65 && charCode <= 70) || // A-F
      (charCode >= 97 && charCode <= 102); // a-f
    if (!isHexDigit) return false;
  }

  return true;
}

function extractRevertDataCandidates(error: unknown): string[] {
  const candidates: string[] = [];
  const seen = new WeakSet<object>();
  const queue: Array<{ value: unknown; depth: number }> = [
    { value: error, depth: 0 },
  ];
  const maxDepth = 6;
  const maxNodes = 200;
  let visited = 0;

  while (queue.length > 0 && visited < maxNodes) {
    const current = queue.shift();
    if (!current) break;

    const { value, depth } = current;
    visited++;

    if (isHexData(value)) {
      candidates.push(value);
    } else if (typeof value === 'string') {
      // Some libraries embed revert data as a substring in a larger message.
      const matches = value.match(/0x[0-9a-fA-F]{8,}/g);
      if (matches) {
        for (const match of matches) {
          if (isHexData(match)) candidates.push(match);
        }
      }
    }

    if (!value || typeof value !== 'object' || depth >= maxDepth) continue;
    if (seen.has(value as object)) continue;
    seen.add(value as object);

    if (Array.isArray(value)) {
      for (const item of value) {
        queue.push({ value: item, depth: depth + 1 });
      }
      continue;
    }

    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      queue.push({ value: record[key], depth: depth + 1 });
    }
  }

  // Normalize + dedupe.
  return Array.from(
    new Set(candidates.map((candidate) => candidate.toLowerCase())),
  );
}

function extractErrorMessageCandidates(error: unknown): string[] {
  const candidates: string[] = [];
  const seen = new WeakSet<object>();
  const queue: Array<{ value: unknown; depth: number }> = [
    { value: error, depth: 0 },
  ];
  const maxDepth = 4;
  const maxNodes = 120;
  let visited = 0;

  while (queue.length > 0 && visited < maxNodes) {
    const current = queue.shift();
    if (!current) break;

    const { value, depth } = current;
    visited++;

    if (typeof value === 'string' && value.length > 0) {
      candidates.push(value);
    }

    if (!value || typeof value !== 'object' || depth >= maxDepth) continue;
    if (seen.has(value as object)) continue;
    seen.add(value as object);

    if (Array.isArray(value)) {
      for (const item of value) {
        queue.push({ value: item, depth: depth + 1 });
      }
      continue;
    }

    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      queue.push({ value: record[key], depth: depth + 1 });
    }
  }

  return candidates;
}

/**
 * Check if an error is a KeepWhatsRaisedPledgeAlreadyProcessed revert.
 * ethers v6 CALL_EXCEPTION errors can carry revert data in different shapes
 * depending on whether it failed in `estimateGas` vs `sendTransaction`.
 */
function isPledgeAlreadyProcessedError(error: unknown): boolean {
  const selector = PLEDGE_ALREADY_PROCESSED_SELECTOR.toLowerCase();
  const errorName = PLEDGE_ALREADY_PROCESSED_ERROR_NAME.toLowerCase();

  // Fast-path: message fields sometimes include the custom error name.
  const messageCandidates = extractErrorMessageCandidates(error);
  for (const message of messageCandidates) {
    if (message.toLowerCase().includes(errorName)) {
      return true;
    }
  }

  // Robust-path: search for revert data and match selector or decode via ABI.
  const revertDataCandidates = extractRevertDataCandidates(error);
  for (const data of revertDataCandidates) {
    if (!data.startsWith('0x')) continue;
    if (data.startsWith(selector)) return true;

    try {
      const parsed = keepWhatsRaisedInterface.parseError(data);
      if (parsed?.name === PLEDGE_ALREADY_PROCESSED_ERROR_NAME) {
        return true;
      }
    } catch {
      // Ignore: data might be a tx hash or a different contract's revert.
    }
  }

  return false;
}

/**
 * Check if a pledge already exists on the blockchain by calling the s_processedPledges getter.
 * The contract tracks processed pledges using internalPledgeId = keccak256(abi.encodePacked(pledgeId, adminAddress)).
 *
 * @param treasuryContract - Treasury contract instance
 * @param pledgeId - Pledge ID to check
 * @param adminAddress - Admin wallet address used in internal pledge ID calculation
 * @returns true if pledge exists on-chain, false otherwise
 */
async function isPledgeExecutedOnChain(
  treasuryContract: ethers.Contract,
  pledgeId: string,
  adminAddress: string,
): Promise<boolean> {
  try {
    // Compute the internal pledge ID used by the contract
    // internalPledgeId = keccak256(abi.encodePacked(pledgeId, msg.sender))
    // where msg.sender is the admin address
    const internalPledgeId = keccak256(
      encodePacked(
        ['bytes32', 'address'],
        [pledgeId as `0x${string}`, adminAddress as `0x${string}`],
      ),
    );

    // Call the s_processedPledges getter (available in ABI)
    const isProcessed =
      await treasuryContract.s_processedPledges(internalPledgeId);

    logVerbose('On-chain pledge verification via s_processedPledges', {
      pledgeId,
      adminAddress,
      internalPledgeId,
      isProcessed,
    });

    return isProcessed;
  } catch (error) {
    // Log prominently - silent failures here cause duplicate execution attempts
    // that revert with KeepWhatsRaisedPledgeAlreadyProcessed
    logError(
      'On-chain pledge check via s_processedPledges FAILED - cannot verify pledge status',
      {
        pledgeId,
        adminAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    );
    return false;
  }
}

/**
 * Execute a gateway pledge using setFeeAndPledge.
 *
 * Token Flow:
 * - Admin wallet approves treasury for (pledgeAmount + tipAmount)
 * - Contract calls safeTransferFrom(admin, treasury, pledgeAmount + tipAmount)
 * - Both pledge and tip are transferred TO the treasury contract
 * - Tips tracked separately in contract state (s_tip, s_tokenToTippedAmount)
 * - Platform admin can later claim accumulated tips using claimTip()
 * - User receives pledge NFT for the pledge amount (tip excluded from refundable amount)
 *
 * Reliability Features:
 * - PostgreSQL transaction-level advisory locks prevent concurrent execution
 * - DETERMINISTIC pledge ID generation from stable fields (treasuryAddress, userAddress, paymentId)
 * - Pledge ID stored BEFORE blockchain operations (enables deterministic retries)
 * - Same inputs always produce same pledge ID, preventing duplicate on-chain executions after crashes
 * - Early idempotency check prevents re-execution
 * - Optimistic locking prevents race conditions
 * - Transaction timeouts prevent indefinite hangs
 * - Lock automatically released when transaction commits/rolls back
 *
 * @param paymentId - Internal payment record ID
 * @returns Execution result with transaction hash and amounts
 * @throws ApiParameterError if payment invalid or already executed
 * @throws ApiUpstreamError if insufficient balance or transaction fails
 */
export async function executeGatewayPledge(
  paymentId: number,
): Promise<ExecuteGatewayPledgeResponse> {
  logVerbose('Starting gateway pledge execution for payment:', {
    paymentId,
  });

  // Allow retrying PENDING payments if they've been stuck for more than 5 minutes
  // This handles lambda timeouts while still preventing concurrent executions
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const pendingUpdate = await db.payment.updateMany({
    where: {
      id: paymentId,
      OR: [
        // Not currently PENDING
        { pledgeExecutionStatus: { not: 'PENDING' } },
        // OR PENDING but stuck (last attempt is null OR > 5 minutes ago)
        {
          pledgeExecutionStatus: 'PENDING',
          OR: [
            { pledgeExecutionLastAttempt: null },
            { pledgeExecutionLastAttempt: { lt: fiveMinutesAgo } },
          ],
        },
      ],
    },
    data: {
      pledgeExecutionStatus: 'PENDING',
      pledgeExecutionAttempts: { increment: 1 },
      pledgeExecutionLastAttempt: new Date(),
    },
  });

  // If update affected 0 rows, another execution is actively in progress
  if (pendingUpdate.count === 0) {
    logError('Optimistic lock failed - payment is actively being executed', {
      paymentId,
      note: 'Another process is currently executing this pledge',
    });
    throw new ApiParameterError(
      `Payment ${paymentId} is already being executed by another process`,
    );
  }

  logVerbose('Payment status set to PENDING (committed to DB)', {
    paymentId,
    note: 'UI should now show executing state',
  });

  // Wrap execution in try-catch to handle timeouts gracefully
  // If execution fails (including timeout), we need to mark as FAILED in a SEPARATE transaction
  try {
    // Use withExecutionLock to acquire transaction-level advisory lock
    // The lock is held for the entire execution and automatically released when transaction ends
    return await withExecutionLock(paymentId, async (tx) => {
      // Wrap execution with overall timeout to prevent indefinite hangs
      return await waitWithTimeout(
        _executeGatewayPledgeWithLock(paymentId, tx),
        TIMEOUT_VALUES.OVERALL_EXECUTION,
        'gateway pledge execution',
        { paymentId },
      );
    });
  } catch (error) {
    // Execution failed (timeout, blockchain error, etc.)
    // Mark as FAILED in a SEPARATE transaction so UI can show the failure
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logError('Execution failed, marking as FAILED in separate transaction', {
      paymentId,
      error: errorMessage,
    });

    // Update status outside the locked transaction so it persists
    await db.payment.update({
      where: { id: paymentId },
      data: {
        pledgeExecutionStatus: 'FAILED',
        pledgeExecutionError: errorMessage,
      },
    });

    logVerbose('Payment marked as FAILED (committed to DB)', {
      paymentId,
      error: errorMessage,
      note: 'UI should now show failed state with retry option',
    });

    // Return graceful failure response
    return {
      success: false,
      paymentId,
      error: errorMessage,
    } as ExecuteGatewayPledgeResponse;
  }
}

type TransactionClient = Omit<
  typeof db,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Internal execution function that runs with transaction-level advisory lock held.
 *
 * All database operations MUST use the provided transaction client (tx)
 * to ensure they run within the same transaction that holds the advisory lock.
 * The lock is automatically released when the transaction commits or rolls back.
 *
 * @param paymentId - Payment ID to execute
 * @param tx - Prisma transaction client (holds the transaction-level advisory lock)
 */
async function _executeGatewayPledgeWithLock(
  paymentId: number,
  tx: TransactionClient,
): Promise<ExecuteGatewayPledgeResponse> {
  // Load payment with related data using transaction client
  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      campaign: true,
    },
  });

  const logAddress = payment?.user.address;
  const prefixId = `${payment?.daimoPaymentId}/${paymentId.toString()}`;

  if (!payment) {
    throw new ApiParameterError(`Payment not found: ${paymentId.toString()}`);
  }

  logVerbose('Payment loaded successfully', {
    prefixId,
    logAddress,
    paymentId,
    pledgeExecutionStatus: payment.pledgeExecutionStatus,
    pledgeExecutionAttempts: payment.pledgeExecutionAttempts,
    pledgeExecutionLastAttempt:
      payment.pledgeExecutionLastAttempt?.toISOString(),
  });

  // EARLY IDEMPOTENCY CHECK: Check if already executed BEFORE updating status
  // This prevents re-execution window that existed when this check happened later
  const metadata = payment.metadata as Record<string, unknown>;
  if (metadata?.onChainPledgeId) {
    logVerbose('Pledge already executed (early check)', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      onChainPledgeId: metadata.onChainPledgeId,
    });

    // Update payment status back to SUCCESS since it was already executed
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        pledgeExecutionStatus: 'SUCCESS',
        pledgeExecutionError: null,
        pledgeExecutionTxHash: metadata.treasuryTxHash as string,
      },
    });

    logVerbose('Payment status corrected to SUCCESS', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      pledgeExecutionStatus: updatedPayment.pledgeExecutionStatus,
    });

    return {
      success: true,
      paymentId,
      pledgeId: metadata.onChainPledgeId as string,
      transactionHash: metadata.treasuryTxHash as string,
      blockNumber: 0,
      pledgeAmount: (metadata.pledgeAmount as string) || '0',
      tipAmount: (metadata.tipAmount as string) || '0',
    };
  }

  // Check if payment is stuck in PENDING (potential crash scenario)
  // If status is PENDING, a previous attempt may have succeeded on-chain but crashed before DB update
  if (payment.pledgeExecutionStatus === 'PENDING') {
    logVerbose('Payment is PENDING - checking for potential crash scenario', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      lastAttempt: payment.pledgeExecutionLastAttempt?.toISOString(),
      attempts: payment.pledgeExecutionAttempts,
      note: 'Will check if blockchain operations already succeeded',
    });

    // If we have a generated pledge ID but no onChainPledgeId, this might be a retry
    // after crash. The pledge ID tells us what to look for on-chain.
    if (metadata?.generatedPledgeId && !metadata?.onChainPledgeId) {
      logVerbose('Found generated pledge ID without execution confirmation', {
        prefixId,
        logAddress,
        paymentId: payment.id,
        generatedPledgeId: metadata.generatedPledgeId,
        note: 'This indicates potential crash after pledge ID generation. Will attempt recovery with same pledge ID.',
      });

      // TODO: In future enhancement, query blockchain here to verify if pledge exists
      // For now, we'll proceed with the stored pledge ID (safe because we use same ID)
    }
  }

  try {
    return await _executeGatewayPledgeInternal(payment, tx, {
      prefixId,
      logAddress,
    });
  } catch (error) {
    // Mark execution as failed with error message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logError('Execution failed:', {
      prefixId,
      logAddress,
      paymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const failedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        pledgeExecutionStatus: 'FAILED',
        pledgeExecutionError: errorMessage,
      },
    });

    logVerbose('Payment updated to FAILED', {
      prefixId,
      logAddress,
      paymentId,
      pledgeExecutionStatus: failedPayment.pledgeExecutionStatus,
      pledgeExecutionError: failedPayment.pledgeExecutionError,
    });

    // DON'T re-throw - we want the FAILED status to persist
    // Return an error response instead so the transaction can commit
    return {
      success: false,
      paymentId,
      error: errorMessage,
    } as ExecuteGatewayPledgeResponse;
  }
}

/**
 * Internal implementation of gateway pledge execution.
 * Separated for clean error handling and status tracking.
 *
 * @param payment - Payment record with related data
 * @param tx - Prisma transaction client (must be used for all DB operations)
 * @param context - Logging context
 */
async function _executeGatewayPledgeInternal(
  payment: Prisma.PaymentGetPayload<{
    include: { user: true; campaign: true };
  }>,
  tx: TransactionClient,
  { prefixId, logAddress }: { prefixId?: string; logAddress?: string } = {},
): Promise<ExecuteGatewayPledgeResponse> {
  logVerbose('Starting internal gateway pledge execution', {
    prefixId,
    logAddress,
    paymentId: payment.id,
    pledgeExecutionStatus: payment.pledgeExecutionStatus,
    pledgeExecutionAttempts: payment.pledgeExecutionAttempts,
    pledgeExecutionLastAttempt:
      payment.pledgeExecutionLastAttempt?.toISOString(),
  });

  if (!payment) {
    throw new ApiParameterError('Payment not found');
  }

  // Validate payment is ready for execution
  if (payment.status !== 'confirmed') {
    throw new ApiParameterError(
      `Payment must be confirmed before execution. Current status: ${payment.status}`,
    );
  }

  if (payment.provider !== 'daimo') {
    throw new ApiParameterError(
      `Only Daimo payments can be executed via gateway. Provider: ${payment.provider}`,
    );
  }

  // NOTE: Idempotency check now happens earlier in _executeGatewayPledgeWithLock
  // This prevents the re-execution window that existed before

  logVerbose('Extracting amounts from payment', {
    prefixId,
    logAddress,
    paymentId: payment.id,
    paymentAmount: payment.amount,
  });

  // Extract metadata for tip amount
  let metadata = payment.metadata as Record<string, unknown>;

  // Extract amounts from payment and parse to token units
  // payment.amount contains ONLY the pledge amount (matching direct wallet flow)
  // Tip is stored separately in metadata
  const pledgeAmountUnits = ethers.parseUnits(payment.amount, USD_DECIMALS);
  const tipAmountUnits = ethers.parseUnits(
    (metadata?.tipAmount as string) || '0',
    USD_DECIMALS,
  );
  const totalAmountUnits = pledgeAmountUnits + tipAmountUnits;

  logVerbose('Amount calculation breakdown', {
    prefixId,
    logAddress,
    paymentAmount: payment.amount,
    metadataTipAmount: (metadata?.tipAmount as string) || '0',
    metadataPledgeAmount: (metadata?.pledgeAmount as string) || 'N/A',
    metadataTotalReceived:
      (metadata?.totalReceivedFromDaimo as string) || 'N/A',
    calculatedPledgeUnits: pledgeAmountUnits.toString(),
    calculatedTipUnits: tipAmountUnits.toString(),
    calculatedTotalUnits: totalAmountUnits.toString(),
    formattedPledge: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    formattedTip: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    formattedTotal: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
  });

  if (pledgeAmountUnits <= 0n) {
    throw new ApiParameterError(
      'Invalid pledge amount: must be greater than zero',
    );
  }

  // Verify required environment variables
  const rpcUrl = NEXT_PUBLIC_RPC_URL;
  const adminPrivateKey = PLATFORM_ADMIN_PRIVATE_KEY;
  const adminAddress = NEXT_PUBLIC_PLATFORM_ADMIN;

  if (!rpcUrl || !adminPrivateKey || !adminAddress || !USD_ADDRESS) {
    logError('Missing environment variables', {
      prefixId,
      logAddress,
      hasRpcUrl: !!rpcUrl,
      hasAdminPrivateKey: !!adminPrivateKey,
      hasAdminAddress: !!adminAddress,
      hasUsdAddress: !!USD_ADDRESS,
    });
    throw new ApiParameterError(
      'Server configuration error: missing RPC, admin credentials, or USD token address',
    );
  }

  if (!payment.campaign.treasuryAddress) {
    logError('Campaign does not have a treasury address configured', {
      prefixId,
      logAddress,
      campaignId: payment.campaign.id,
      campaignTitle: payment.campaign.title,
    });
    throw new ApiParameterError(
      'Campaign does not have a treasury address configured',
    );
  }

  // Initialize provider and admin signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const adminSigner = new ethers.Wallet(adminPrivateKey, provider);

  logVerbose('Admin signer initialized', {
    prefixId,
    logAddress,
    adminAddress: adminSigner.address,
    treasuryAddress: payment.campaign.treasuryAddress,
  });

  // Verify private key matches public address
  if (adminSigner.address.toLowerCase() !== adminAddress.toLowerCase()) {
    logError('Admin address mismatch', {
      prefixId,
      logAddress,
      derivedFromKey: adminSigner.address,
      configured: adminAddress,
    });
    throw new ApiParameterError(
      'Admin private key does not match configured admin address',
    );
  }

  logVerbose('Admin wallet verified', {
    prefixId,
    logAddress,
    adminSignerAddress: adminSigner.address,
    treasuryAddress: payment.campaign.treasuryAddress,
  });

  // Initialize contracts
  const usdContract = new ethers.Contract(
    USD_ADDRESS as string,
    erc20Abi,
    adminSigner,
  );

  const treasuryContract = new ethers.Contract(
    payment.campaign.treasuryAddress,
    KeepWhatsRaisedABI,
    adminSigner,
  );

  logVerbose('Contracts initialized', {
    prefixId,
    logAddress,
    usdContractAddress: USD_ADDRESS,
    treasuryContractAddress: payment.campaign.treasuryAddress,
  });

  // Generate or retrieve pledge ID BEFORE any blockchain operations
  // This ensures we can check on-chain status with the correct pledge ID
  // DETERMINISTIC generation: Same inputs always produce same pledge ID
  let pledgeId: string;

  if (metadata?.generatedPledgeId) {
    // RETRY case: Use existing pledge ID from previous attempt
    pledgeId = metadata.generatedPledgeId as string;
    logVerbose('Using existing pledge ID from previous attempt', {
      prefixId,
      logAddress,
      pledgeId,
      note: 'This is a retry - reusing same pledge ID to prevent duplicates',
    });
  } else {
    // FIRST ATTEMPT: Generate deterministic pledge ID
    // Using stable fields (treasuryAddress, user address, payment ID)
    // to ensure the same pledge ID is generated even after crashes
    pledgeId = computeDeterministicPledgeId({
      treasuryAddress: payment.campaign.treasuryAddress,
      userAddress: payment.user.address,
      paymentId: payment.id,
    });

    logVerbose('Generated NEW deterministic pledge ID', {
      prefixId,
      logAddress,
      pledgeId,
      treasuryAddress: payment.campaign.treasuryAddress,
      userAddress: payment.user.address,
      paymentId: payment.id,
      note: 'First execution attempt - deterministic hash from stable fields',
    });

    // Store pledge ID IMMEDIATELY in database BEFORE blockchain operations
    // If crash occurs during blockchain operations, pledge ID is preserved for retry
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...(payment.metadata as Record<string, unknown>),
          generatedPledgeId: pledgeId,
          pledgeGeneratedAt: new Date().toISOString(),
        },
      },
    });

    // Update metadata reference for later use
    metadata = updatedPayment.metadata as Record<string, unknown>;

    logVerbose('Deterministic pledge ID stored in database', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      pledgeId,
      note: 'Safe to proceed with blockchain operations',
    });
  }

  // Verify pledge doesn't already exist on-chain using s_processedPledges getter
  // This prevents overpayment if previous execution succeeded but DB wasn't updated
  // Because pledgeId is deterministic, retries after crashes check for the SAME pledge ID
  const pledgeExistsOnChain = await isPledgeExecutedOnChain(
    treasuryContract,
    pledgeId,
    adminAddress,
  );

  if (pledgeExistsOnChain) {
    logVerbose(
      '⚠️  SAFETY CHECK: Pledge already exists on-chain, skipping execution',
      {
        prefixId,
        logAddress,
        paymentId: payment.id,
        pledgeId,
        note: 'Previous execution succeeded on-chain but DB was not updated. Fixing status now.',
      },
    );

    // Update payment status to SUCCESS since pledge already exists on-chain
    // Store deterministic pledgeId as onChainPledgeId
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        pledgeExecutionStatus: 'SUCCESS',
        pledgeExecutionError: null,
        metadata: {
          ...metadata,
          onChainPledgeId: pledgeId, // Deterministic hash ensures consistency
          recoveredFromIncompleteExecution: true,
          recoveredAt: new Date().toISOString(),
        },
      },
    });

    logVerbose('Payment status corrected to SUCCESS (on-chain verification)', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      pledgeExecutionStatus: updatedPayment.pledgeExecutionStatus,
    });

    return {
      success: true,
      paymentId: payment.id,
      pledgeId, // Deterministic pledgeId returned
      pledgeAmount: (metadata.pledgeAmount as string) || payment.amount,
      tipAmount: (metadata.tipAmount as string) || '0',
      reconciled: true,
      reconciliationReason:
        's_processedPledges indicates pledge already executed',
    };
  }

  logVerbose('On-chain verification passed: pledge does not exist yet', {
    prefixId,
    logAddress,
    pledgeId,
    note: 'Safe to proceed with pledge execution using deterministic pledge ID',
  });

  // Check admin wallet balance (with timeout to prevent hangs)
  const adminBalance = await waitWithTimeout(
    usdContract.balanceOf(adminSigner.address),
    TIMEOUT_VALUES.READ_OPERATION,
    'read admin wallet balance',
    { prefixId, logAddress, adminAddress: adminSigner.address },
  );
  const adminBalanceFormatted = ethers.formatUnits(adminBalance, USD_DECIMALS);

  logVerbose('Admin wallet balance check', {
    prefixId,
    logAddress,
    adminAddress: adminSigner.address,
    balance: adminBalanceFormatted,
    required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    hasEnough: adminBalance >= totalAmountUnits,
  });

  if (adminBalance < totalAmountUnits) {
    logError('Insufficient admin wallet balance', {
      prefixId,
      logAddress,
      adminAddress: adminSigner.address,
      balance: adminBalanceFormatted,
      required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    });
    throw new ApiUpstreamError(
      `Insufficient admin wallet balance. Required: ${ethers.formatUnits(totalAmountUnits, USD_DECIMALS)} USDT, Available: ${adminBalanceFormatted} USDT`,
    );
  }

  /**
   * Gateway fee: No additional fee for gateway payments.
   * Treasury configured fees (gross percentage + protocol) apply automatically
   * during contract execution, maintaining consistency with direct wallet pledges.
   */
  const gatewayFee = 0n;

  logVerbose('Processing amounts:', {
    prefixId,
    logAddress,
    totalReceived: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    pledgeAmountUnits: pledgeAmountUnits.toString(),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    tipAmountUnits: tipAmountUnits.toString(),
    gatewayFee: ethers.formatUnits(gatewayFee, USD_DECIMALS),
    gatewayFeeUnits: gatewayFee.toString(),
    treasuryAddress: payment.campaign.treasuryAddress,
    note: 'Both pledge and tip transferred to treasury. Tips tracked separately in contract for claiming.',
    note2: 'Using treasury configured fees only, no additional gateway fee',
  });

  // Deterministic pledge ID was already generated and verified earlier in the function
  // Same stable fields (treasuryAddress, userAddress, paymentId) always produce same pledgeId
  // This ensures retries after crashes use the same pledge ID, preventing duplicate on-chain executions

  // Check current allowance (with timeout to prevent hangs)
  const currentAllowance = await waitWithTimeout(
    usdContract.allowance(
      adminSigner.address,
      payment.campaign.treasuryAddress,
    ),
    TIMEOUT_VALUES.READ_OPERATION,
    'read token allowance',
    { prefixId, logAddress, adminAddress: adminSigner.address },
  );

  logVerbose('Current allowance', {
    prefixId,
    logAddress,
    current: ethers.formatUnits(currentAllowance, USD_DECIMALS),
    required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
  });

  // Approve treasury for total amount if needed
  if (currentAllowance < totalAmountUnits) {
    logVerbose('Approving treasury for total amount (pledge + tip)', {
      prefixId,
      logAddress,
      currentAllowance: ethers.formatUnits(currentAllowance, USD_DECIMALS),
      required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    });

    const approveTx = await usdContract.approve(
      payment.campaign.treasuryAddress,
      totalAmountUnits,
      {
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxFeePerGas: ethers.parseUnits('100', 'gwei'),
      },
    );

    logVerbose('Approval transaction submitted', {
      prefixId,
      logAddress,
      hash: approveTx.hash,
    });

    // Wait for approval using polling with fallback
    // This handles slow RPC providers that are common cause of timeouts
    // Total max time: 60s (wait) + 60s (poll) = 120s
    await waitForTransactionWithPolling(
      approveTx,
      provider,
      'token approval transaction',
      TIMEOUT_VALUES.APPROVAL_TX, // Try tx.wait() for 60 seconds
      TIMEOUT_VALUES.APPROVAL_TX, // Then poll for up to 60 seconds more
      { prefixId, logAddress },
    );

    logVerbose('Approval confirmed', {
      prefixId,
      logAddress,
      hash: approveTx.hash,
    });
  }

  // Execute setFeeAndPledge - transfers pledge + tip to treasury
  // Using deterministic pledgeId ensures same pledge ID on retries after crashes
  logVerbose('Executing setFeeAndPledge with deterministic pledge ID', {
    prefixId,
    logAddress,
    pledgeId,
    backer: payment.user.address,
    pledgeAmountUnits: pledgeAmountUnits.toString(),
    pledgeAmountFormatted: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmountUnits: tipAmountUnits.toString(),
    tipAmountFormatted: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    gatewayFee: gatewayFee.toString(),
    totalToTransfer: (pledgeAmountUnits + tipAmountUnits).toString(),
    totalToTransferFormatted: ethers.formatUnits(
      pledgeAmountUnits + tipAmountUnits,
      USD_DECIMALS,
    ),
    reward: '[]',
    isPledgeForAReward: false,
  });

  let treasuryTx;
  try {
    treasuryTx = await treasuryContract.setFeeAndPledge(
      pledgeId, // Deterministic hash from stable fields
      payment.user.address,
      pledgeAmountUnits,
      tipAmountUnits,
      gatewayFee,
      [],
      false,
      {
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxFeePerGas: ethers.parseUnits('100', 'gwei'),
      },
    );
  } catch (error) {
    // If the contract reverts with PledgeAlreadyProcessed, the pledge was already
    // executed on-chain but the DB wasn't updated (e.g. lambda timeout after tx confirmed).
    // Reconcile the database instead of marking as failed.
    if (isPledgeAlreadyProcessedError(error)) {
      logVerbose(
        'Pledge already processed on-chain (detected via contract revert), reconciling database',
        {
          prefixId,
          logAddress,
          paymentId: payment.id,
          pledgeId,
          note: 'Previous execution succeeded on-chain but DB was not updated. Fixing status now.',
        },
      );

      const existingTreasuryTxHash =
        typeof payment.pledgeExecutionTxHash === 'string'
          ? payment.pledgeExecutionTxHash
          : typeof metadata.treasuryTxHash === 'string'
            ? metadata.treasuryTxHash
            : null;

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          pledgeExecutionStatus: 'SUCCESS',
          pledgeExecutionError: null,
          pledgeExecutionTxHash: existingTreasuryTxHash,
          metadata: {
            ...metadata,
            onChainPledgeId: pledgeId,
            recoveredFromPledgeAlreadyProcessed: true,
            recoveredAt: new Date().toISOString(),
            treasuryTxHash: existingTreasuryTxHash ?? undefined,
          },
        },
      });

      return {
        success: true,
        paymentId: payment.id,
        pledgeId,
        pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
        tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
        reconciled: true,
        reconciliationReason:
          'setFeeAndPledge reverted with KeepWhatsRaisedPledgeAlreadyProcessed',
      };
    }
    throw error;
  }

  logVerbose('Transaction submitted:', {
    prefixId,
    logAddress,
    hash: treasuryTx.hash,
    from: adminSigner.address,
    to: payment.campaign.treasuryAddress,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  });

  // Save tx hash IMMEDIATELY after submission
  // This ensures we can track the transaction even if Vercel lambda times out
  // Status remains PENDING (which means "executing") but we now have the tx hash
  await tx.payment.update({
    where: { id: payment.id },
    data: {
      pledgeExecutionTxHash: treasuryTx.hash,
      pledgeExecutionError: null, // Clear any previous error
    },
  });

  logVerbose('Transaction hash saved to database', {
    prefixId,
    logAddress,
    paymentId: payment.id,
    pledgeExecutionStatus: 'PENDING',
    pledgeExecutionTxHash: treasuryTx.hash,
    note: 'Transaction hash saved - safe to wait for confirmation now',
  });

  // Wait for confirmation using polling with fallback
  // This handles slow RPC providers by falling back to polling if tx.wait() times out
  // Total max time: 30s (wait) + 60s (poll) = 90s
  const receipt = await waitForTransactionWithPolling(
    treasuryTx,
    provider,
    'setFeeAndPledge transaction confirmation',
    TIMEOUT_VALUES.PLEDGE_TX, // Try tx.wait() for 30 seconds
    TIMEOUT_VALUES.APPROVAL_TX, // Then poll for up to 60 seconds
    { prefixId, logAddress },
  );

  logVerbose('Transaction confirmed:', {
    prefixId,
    logAddress,
    hash: treasuryTx.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status ? 'SUCCESS' : 'FAILED',
    gasUsed: receipt.gasUsed?.toString(),
  });

  // Get final admin wallet balance (with timeout)
  const finalAdminBalance = await waitWithTimeout(
    usdContract.balanceOf(adminSigner.address),
    TIMEOUT_VALUES.READ_OPERATION,
    'read final admin wallet balance',
    { prefixId, logAddress, adminAddress: adminSigner.address },
  );
  const finalAdminBalanceFormatted = ethers.formatUnits(
    finalAdminBalance,
    USD_DECIMALS,
  );

  logVerbose('Final admin wallet balance:', {
    prefixId,
    logAddress,
    adminAddress: adminSigner.address,
    before: adminBalanceFormatted,
    after: finalAdminBalanceFormatted,
    totalSpent: ethers.formatUnits(
      adminBalance - finalAdminBalance,
      USD_DECIMALS,
    ),
    expectedSpent: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    remaining: finalAdminBalanceFormatted,
  });

  // Update payment metadata with execution details
  // Store deterministic pledgeId as onChainPledgeId for future idempotency checks
  const executionMetadata: GatewayPledgeMetadata = {
    onChainPledgeId: pledgeId, // Deterministic hash from stable fields
    treasuryTxHash: treasuryTx.hash,
    executionTimestamp: new Date().toISOString(),
    adminWalletBalanceBefore: adminBalanceFormatted,
    adminWalletBalanceAfter: finalAdminBalanceFormatted,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  };

  // Mark execution as successful with transaction hash
  const updatedPayment = await tx.payment.update({
    where: { id: payment.id },
    data: {
      pledgeExecutionStatus: 'SUCCESS',
      pledgeExecutionTxHash: treasuryTx.hash,
      pledgeExecutionError: null,
      metadata: {
        ...(payment.metadata as Record<string, unknown>),
        ...executionMetadata,
      },
    },
  });

  logVerbose('Payment metadata updated and marked as SUCCESS:', {
    prefixId,
    logAddress,
    paymentId: payment.id,
    pledgeId,
    txHash: treasuryTx.hash,
    pledgeExecutionStatus: updatedPayment.pledgeExecutionStatus,
    pledgeExecutionTxHash: updatedPayment.pledgeExecutionTxHash,
    pledgeExecutionError: updatedPayment.pledgeExecutionError,
    metadata: updatedPayment.metadata,
  });

  const result: ExecuteGatewayPledgeResponse = {
    success: true,
    paymentId: payment.id,
    pledgeId,
    transactionHash: treasuryTx.hash,
    blockNumber: receipt.blockNumber ?? 0,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  };

  logVerbose('Pledge execution complete:', {
    prefixId,
    logAddress,
    paymentId: payment.id,
    pledgeId,
    transactionHash: treasuryTx.hash,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    adminWalletRemaining: finalAdminBalanceFormatted,
    treasuryAddress: payment.campaign.treasuryAddress,
  });

  return result;
}
