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
import { log, LogType } from '@/lib/debug';

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

const logVerbose = logFactory('verbose', '🚀 DaimoPledge');

const logError = logFactory('error', '🚨 DaimoPledge');

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

  // Load payment with related data
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      campaign: true,
    },
  });

  const address = payment?.user.address;
  const id = `${payment?.daimoPaymentId}/${paymentId.toString()}`;

  if (!payment) {
    throw new ApiParameterError(`Payment not found: ${paymentId.toString()}`);
  }

  logVerbose('Payment loaded successfully', {
    id,
    address,
    paymentId,
    pledgeExecutionStatus: payment.pledgeExecutionStatus,
    pledgeExecutionAttempts: payment.pledgeExecutionAttempts,
    pledgeExecutionLastAttempt:
      payment.pledgeExecutionLastAttempt?.toISOString(),
  });

  // Mark execution as pending and increment attempts
  const updatedPayment = await db.payment.update({
    where: { id: paymentId },
    data: {
      pledgeExecutionStatus: 'PENDING',
      pledgeExecutionAttempts: { increment: 1 },
      pledgeExecutionLastAttempt: new Date(),
    },
  });

  logVerbose('Payment updated to PENDING', {
    id,
    address,
    paymentId,
    pledgeExecutionStatus: updatedPayment.pledgeExecutionStatus,
    pledgeExecutionAttempts: updatedPayment.pledgeExecutionAttempts,
    pledgeExecutionLastAttempt:
      updatedPayment.pledgeExecutionLastAttempt?.toISOString(),
  });

  try {
    return await _executeGatewayPledgeInternal(payment, { id, address });
  } catch (error) {
    // Mark execution as failed with error message
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logError('Execution failed:', {
      id,
      address,
      paymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    const failedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        pledgeExecutionStatus: 'FAILED',
        pledgeExecutionError: errorMessage,
      },
    });

    logVerbose('Payment updated to FAILED', {
      id,
      address,
      paymentId,
      pledgeExecutionStatus: failedPayment.pledgeExecutionStatus,
      pledgeExecutionError: failedPayment.pledgeExecutionError,
    });

    throw error;
  }
}

/**
 * Internal implementation of gateway pledge execution.
 * Separated for clean error handling and status tracking.
 */
async function _executeGatewayPledgeInternal(
  payment: Prisma.PaymentGetPayload<{
    include: { user: true; campaign: true };
  }>,
  { id, address }: { id?: string; address?: string } = {},
): Promise<ExecuteGatewayPledgeResponse> {
  logVerbose('Starting internal gateway pledge execution', {
    id,
    address,
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

  // Check if already executed
  const metadata = payment.metadata as Record<string, unknown>;
  if (metadata?.onChainPledgeId) {
    logVerbose('Pledge already executed', {
      id,
      address,
      paymentId: payment.id,
      onChainPledgeId: metadata.onChainPledgeId,
    });

    // Update payment status back to SUCCESS since it was already executed
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        pledgeExecutionStatus: 'SUCCESS',
        pledgeExecutionError: null, // Clear any previous error
        pledgeExecutionTxHash: metadata.treasuryTxHash as string,
      },
    });

    logVerbose('Payment updated to SUCCESS', {
      id,
      address,
      paymentId: payment.id,
      pledgeExecutionStatus: updatedPayment.pledgeExecutionStatus,
      pledgeExecutionError: updatedPayment.pledgeExecutionError,
      pledgeExecutionTxHash: updatedPayment.pledgeExecutionTxHash,
    });

    return {
      success: true,
      pledgeId: metadata.onChainPledgeId as string,
      transactionHash: metadata.treasuryTxHash as string,
      blockNumber: 0, // Not available for already-executed pledges
      pledgeAmount: (metadata.pledgeAmount as string) || '0',
      tipAmount: (metadata.tipAmount as string) || '0',
    };
  }

  logVerbose('Extracting amounts from payment', {
    id,
    address,
    paymentId: payment.id,
    paymentAmount: payment.amount,
  });

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
    id,
    address,
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
      id,
      address,
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
      id,
      address,
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
    id,
    address,
    adminAddress: adminSigner.address,
    treasuryAddress: payment.campaign.treasuryAddress,
  });

  // Verify private key matches public address
  if (adminSigner.address.toLowerCase() !== adminAddress.toLowerCase()) {
    logError('Admin address mismatch', {
      id,
      address,
      derivedFromKey: adminSigner.address,
      configured: adminAddress,
    });
    throw new ApiParameterError(
      'Admin private key does not match configured admin address',
    );
  }

  logVerbose('Admin wallet verified', {
    id,
    address,
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
    id,
    address,
    usdContractAddress: USD_ADDRESS,
    treasuryContractAddress: payment.campaign.treasuryAddress,
  });

  // Check admin wallet balance
  const adminBalance = await usdContract.balanceOf(adminSigner.address);
  const adminBalanceFormatted = ethers.formatUnits(adminBalance, USD_DECIMALS);

  logVerbose('Admin wallet balance check', {
    id,
    address,
    adminAddress: adminSigner.address,
    balance: adminBalanceFormatted,
    required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    hasEnough: adminBalance >= totalAmountUnits,
  });

  if (adminBalance < totalAmountUnits) {
    logError('Insufficient admin wallet balance', {
      id,
      address,
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
    id,
    address,
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

  // Generate unique pledge ID
  const pledgeId = ethers.keccak256(
    ethers.toUtf8Bytes(
      `pledge-${Date.now()}-${payment.user.address}-${payment.id}`,
    ),
  );

  logVerbose('Generated pledge ID', {
    id,
    address,
    pledgeId,
  });

  // Check current allowance
  const currentAllowance = await usdContract.allowance(
    adminSigner.address,
    payment.campaign.treasuryAddress,
  );

  logVerbose('Current allowance', {
    id,
    address,
    current: ethers.formatUnits(currentAllowance, USD_DECIMALS),
    required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
  });

  // Approve treasury for total amount if needed
  if (currentAllowance < totalAmountUnits) {
    logVerbose('Approving treasury for total amount (pledge + tip)', {
      id,
      address,
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

    logVerbose('Approval transaction', {
      id,
      address,
      hash: approveTx.hash,
    });

    await approveTx.wait();

    logVerbose('Approval confirmed', {
      id,
      address,
      hash: approveTx.hash,
    });
  }

  // Execute setFeeAndPledge - transfers pledge + tip to treasury
  logVerbose('Executing setFeeAndPledge', {
    id,
    address,
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

  const tx = await treasuryContract.setFeeAndPledge(
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
    id,
    address,
    hash: tx.hash,
    from: adminSigner.address,
    to: payment.campaign.treasuryAddress,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  });
  // Wait for confirmation
  const receipt = await tx.wait();

  logVerbose('Transaction confirmed:', {
    id,
    address,
    hash: tx.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status ? 'SUCCESS' : 'FAILED',
    gasUsed: receipt.gasUsed?.toString(),
  });

  if (receipt.status !== 1) {
    throw new ApiUpstreamError(`Transaction reverted. Hash: ${tx.hash}`);
  }

  // Get final admin wallet balance
  const finalAdminBalance = await usdContract.balanceOf(adminSigner.address);
  const finalAdminBalanceFormatted = ethers.formatUnits(
    finalAdminBalance,
    USD_DECIMALS,
  );

  logVerbose('Final admin wallet balance:', {
    id,
    address,
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
  const executionMetadata: GatewayPledgeMetadata = {
    onChainPledgeId: pledgeId,
    treasuryTxHash: tx.hash,
    executionTimestamp: new Date().toISOString(),
    adminWalletBalanceBefore: adminBalanceFormatted,
    adminWalletBalanceAfter: finalAdminBalanceFormatted,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  };

  // Mark execution as successful with transaction hash
  const updatedPayment = await db.payment.update({
    where: { id: payment.id },
    data: {
      pledgeExecutionStatus: 'SUCCESS',
      pledgeExecutionTxHash: tx.hash,
      pledgeExecutionError: null,
      metadata: {
        ...(payment.metadata as Record<string, unknown>),
        ...executionMetadata,
      },
    },
  });

  logVerbose('Payment metadata updated and marked as SUCCESS:', {
    id,
    address,
    paymentId: payment.id,
    pledgeId,
    txHash: tx.hash,
    pledgeExecutionStatus: updatedPayment.pledgeExecutionStatus,
    pledgeExecutionTxHash: updatedPayment.pledgeExecutionTxHash,
    pledgeExecutionError: updatedPayment.pledgeExecutionError,
    metadata: updatedPayment.metadata,
  });

  const result: ExecuteGatewayPledgeResponse = {
    success: true,
    pledgeId,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber as number,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  };

  logVerbose('Pledge execution complete:', {
    id,
    address,
    paymentId: payment.id,
    pledgeId,
    transactionHash: tx.hash,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    adminWalletRemaining: finalAdminBalanceFormatted,
    treasuryAddress: payment.campaign.treasuryAddress,
  });

  return result;
}
