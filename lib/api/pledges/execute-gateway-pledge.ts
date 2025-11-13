import { db, type Prisma } from '@/server/db';
import { ApiParameterError, ApiUpstreamError } from '@/lib/api/error';
import { ethers, erc20Abi } from '@/lib/web3';
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
 * - Pledge ID stored BEFORE blockchain operations (enables deterministic retries)
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
    const preparation = await withExecutionLock(paymentId, (tx) =>
      prepareGatewayPledgeWithLock(paymentId, tx),
    );

    if (preparation.state === 'already-executed') {
      return preparation.response;
    }

    return await waitWithTimeout(
      executeGatewayPledgeOnChain(preparation),
      TIMEOUT_VALUES.OVERALL_EXECUTION,
      'gateway pledge execution',
      { paymentId },
    );
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

type PreparedGatewayPledge =
  | {
      state: 'already-executed';
      response: ExecuteGatewayPledgeResponse;
    }
  | {
      state: 'ready';
      payment: Prisma.PaymentGetPayload<{
        include: { user: true; campaign: true };
      }>;
      prefixId?: string;
      logAddress?: string;
    };

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
async function prepareGatewayPledgeWithLock(
  paymentId: number,
  tx: TransactionClient,
): Promise<PreparedGatewayPledge> {
  let payment = await tx.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      campaign: true,
    },
  });

  const logAddress = payment?.user.address ?? '';
  const prefixId = `${payment?.daimoPaymentId ?? 'unknown'}/${paymentId.toString()}`;

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

  const metadata = payment.metadata as Record<string, unknown>;

  if (metadata?.onChainPledgeId) {
    logVerbose('Pledge already executed (early check)', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      onChainPledgeId: metadata.onChainPledgeId,
    });

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
      state: 'already-executed',
      response: {
        success: true,
        paymentId,
        pledgeId: metadata.onChainPledgeId as string,
        transactionHash: metadata.treasuryTxHash as string,
        blockNumber: 0,
        pledgeAmount: (metadata.pledgeAmount as string) || '0',
        tipAmount: (metadata.tipAmount as string) || '0',
      },
    };
  }

  if (payment.pledgeExecutionStatus === 'PENDING') {
    logVerbose('Payment is PENDING - checking for potential crash scenario', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      lastAttempt: payment.pledgeExecutionLastAttempt?.toISOString(),
      attempts: payment.pledgeExecutionAttempts,
      note: 'Will check if blockchain operations already succeeded',
    });

    if (metadata?.generatedPledgeId && !metadata?.onChainPledgeId) {
      logVerbose('Found generated pledge ID without execution confirmation', {
        prefixId,
        logAddress,
        paymentId: payment.id,
        generatedPledgeId: metadata.generatedPledgeId,
        note: 'This indicates potential crash after pledge ID generation. Will attempt recovery with same pledge ID.',
      });
    }
  }

  if (!metadata?.generatedPledgeId) {
    const generatedPledgeId = ethers.keccak256(
      ethers.toUtf8Bytes(
        `pledge-${Date.now()}-${payment.user.address}-${payment.id}`,
      ),
    );

    logVerbose('Generated NEW pledge ID', {
      prefixId,
      logAddress,
      pledgeId: generatedPledgeId,
      note: 'First execution attempt',
    });

    payment = await tx.payment.update({
      where: { id: payment.id },
      include: {
        user: true,
        campaign: true,
      },
      data: {
        metadata: {
          ...(payment.metadata as Record<string, unknown>),
          generatedPledgeId,
          pledgeGeneratedAt: new Date().toISOString(),
        },
      },
    });

    logVerbose('Pledge ID stored in database', {
      prefixId,
      logAddress,
      paymentId: payment.id,
      pledgeId: generatedPledgeId,
      note: 'Safe to proceed with blockchain operations',
    });
  } else {
    logVerbose('Using existing pledge ID from previous attempt', {
      prefixId,
      logAddress,
      pledgeId: metadata.generatedPledgeId,
      note: 'This is a retry - reusing same pledge ID to prevent duplicates',
    });
  }

  return {
    state: 'ready',
    payment,
    prefixId,
    logAddress,
  };
}

/**
 * Internal implementation of gateway pledge execution.
 * Separated for clean error handling and status tracking.
 *
 * @param payment - Payment record with related data
 * @param tx - Prisma transaction client (must be used for all DB operations)
 * @param context - Logging context
 */
type PreparedGatewayPledgeReady = Extract<
  PreparedGatewayPledge,
  { state: 'ready' }
>;

async function executeGatewayPledgeOnChain(
  prepared: PreparedGatewayPledgeReady,
): Promise<ExecuteGatewayPledgeResponse> {
  const { payment, prefixId, logAddress } = prepared;

  logVerbose('Starting gateway pledge execution', {
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

  const metadata = { ...(payment.metadata as Record<string, unknown>) };
  const pledgeId = metadata.generatedPledgeId as string | undefined;

  if (!pledgeId) {
    logError('Missing generated pledge ID before execution', {
      prefixId,
      logAddress,
      paymentId: payment.id,
    });
    throw new ApiParameterError(
      'Gateway pledge execution requires a generated pledge ID',
    );
  }

  logVerbose('Extracting amounts from payment', {
    prefixId,
    logAddress,
    paymentId: payment.id,
    paymentAmount: payment.amount,
  });

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

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const adminSigner = new ethers.Wallet(adminPrivateKey, provider);

  logVerbose('Admin signer initialized', {
    prefixId,
    logAddress,
    adminAddress: adminSigner.address,
    treasuryAddress: payment.campaign.treasuryAddress,
  });

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

    await waitForTransactionWithPolling(
      approveTx,
      provider,
      'token approval transaction',
      TIMEOUT_VALUES.APPROVAL_TX,
      TIMEOUT_VALUES.APPROVAL_TX,
      { prefixId, logAddress },
    );

    logVerbose('Approval confirmed', {
      prefixId,
      logAddress,
      hash: approveTx.hash,
    });
  }

  logVerbose('Executing setFeeAndPledge', {
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

  const treasuryTx = await treasuryContract.setFeeAndPledge(
    pledgeId,
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

  logVerbose('Transaction submitted:', {
    prefixId,
    logAddress,
    hash: treasuryTx.hash,
    from: adminSigner.address,
    to: payment.campaign.treasuryAddress,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  });

  const metadataWithTxHash = {
    ...metadata,
    treasuryTxHash: treasuryTx.hash,
  };

  await db.payment.update({
    where: { id: payment.id },
    data: {
      pledgeExecutionTxHash: treasuryTx.hash,
      pledgeExecutionError: null,
      metadata: metadataWithTxHash as Prisma.InputJsonValue,
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

  const receipt = await waitForTransactionWithPolling(
    treasuryTx,
    provider,
    'setFeeAndPledge transaction confirmation',
    TIMEOUT_VALUES.PLEDGE_TX,
    TIMEOUT_VALUES.APPROVAL_TX,
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

  const executionMetadata: GatewayPledgeMetadata = {
    onChainPledgeId: pledgeId,
    treasuryTxHash: treasuryTx.hash,
    executionTimestamp: new Date().toISOString(),
    adminWalletBalanceBefore: adminBalanceFormatted,
    adminWalletBalanceAfter: finalAdminBalanceFormatted,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  };

  const finalMetadata = {
    ...metadataWithTxHash,
    ...executionMetadata,
  };

  const updatedPayment = await db.payment.update({
    where: { id: payment.id },
    data: {
      pledgeExecutionStatus: 'SUCCESS',
      pledgeExecutionTxHash: treasuryTx.hash,
      pledgeExecutionError: null,
      metadata: finalMetadata as Prisma.InputJsonValue,
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
