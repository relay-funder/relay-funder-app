import { db } from '@/server/db';
import { ApiParameterError, ApiUpstreamError } from '@/lib/api/error';
import { ethers, erc20Abi } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { USD_ADDRESS, USD_DECIMALS } from '@/lib/constant';
import { calculateDaimoGatewayFee } from '@/lib/web3/calculate-gateway-fee';
import { debugApi as debug } from '@/lib/debug';
import type {
  ExecuteGatewayPledgeResponse,
  GatewayPledgeMetadata,
} from '@/lib/api/types/pledges';

/**
 * Execute a gateway pledge using setFeeAndPledge.
 *
 * This function is called by:
 * 1. Daimo Pay webhook after payment_completed
 * 2. Manual retry API endpoint
 *
 * CRITICAL: Tips stay in admin wallet, only pledge amount is transferred to treasury.
 *
 * @param paymentId - Internal payment record ID
 * @returns Execution result with pledge details
 */
export async function executeGatewayPledge(
  paymentId: string,
): Promise<ExecuteGatewayPledgeResponse> {
  debug && console.log('[Execute Gateway] Starting pledge execution');

  // Load payment with related data
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      campaign: {
        include: {
          creator: true,
        },
      },
    },
  });

  if (!payment) {
    throw new ApiParameterError(`Payment not found: ${paymentId}`);
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
    debug &&
      console.log('[Execute Gateway] Pledge already executed:', {
        onChainPledgeId: metadata.onChainPledgeId,
      });
    return {
      success: true,
      pledgeId: metadata.onChainPledgeId as string,
      transactionHash: metadata.treasuryTxHash as string,
      blockNumber: 0, // Not available for already-executed pledges
      pledgeAmount: ((metadata.pledgeAmount as string) || '0'),
      tipAmount: ((metadata.tipAmount as string) || '0'),
    };
  }

  // Extract amounts from payment
  const totalAmount = parseFloat(payment.amount);
  const tipAmount = parseFloat((metadata?.tipAmount as string) || '0');
  const pledgeAmount = totalAmount - tipAmount;

  debug &&
    console.log('[Execute Gateway] Payment amounts:', {
      totalAmount,
      pledgeAmount,
      tipAmount,
      tip_stays_in_admin_wallet: true,
    });

  if (pledgeAmount <= 0) {
    throw new ApiParameterError(
      'Invalid pledge amount: must be greater than zero',
    );
  }

  // Verify required environment variables
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  const adminPrivateKey = process.env.PLATFORM_ADMIN_PRIVATE_KEY;

  if (!rpcUrl || !adminPrivateKey) {
    console.error('[Execute Gateway] Missing environment variables');
    throw new ApiParameterError(
      'Server configuration error: missing RPC or admin credentials',
    );
  }

  if (!payment.campaign.treasuryAddress) {
    throw new ApiParameterError(
      'Campaign does not have a treasury address configured',
    );
  }

  // Initialize provider and admin signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const adminSigner = new ethers.Wallet(adminPrivateKey, provider);

  debug &&
    console.log('[Execute Gateway] Admin wallet:', {
      address: adminSigner.address,
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

  // Check admin wallet balance
  const adminBalance = await usdContract.balanceOf(adminSigner.address);
  const adminBalanceFormatted = ethers.formatUnits(adminBalance, USD_DECIMALS);

  debug &&
    console.log('[Execute Gateway] Admin wallet balance:', {
      balance: adminBalanceFormatted,
      required: totalAmount,
      hasEnough: parseFloat(adminBalanceFormatted) >= totalAmount,
    });

  if (adminBalance < ethers.parseUnits(totalAmount.toString(), USD_DECIMALS)) {
    throw new ApiUpstreamError(
      `Insufficient admin wallet balance. Required: ${totalAmount} USDT, Available: ${adminBalanceFormatted} USDT`,
    );
  }

  // Convert amounts to token units
  const pledgeAmountUnits = ethers.parseUnits(
    pledgeAmount.toString(),
    USD_DECIMALS,
  );
  const tipAmountUnits = ethers.parseUnits(tipAmount.toString(), USD_DECIMALS);

  // Calculate gateway fee (2% of pledge amount)
  const gatewayFee = calculateDaimoGatewayFee(
    pledgeAmount.toString(),
    USD_DECIMALS,
  );

  debug &&
    console.log('[Execute Gateway] Calculated amounts:', {
      pledgeAmountUnits: pledgeAmountUnits.toString(),
      tipAmountUnits: tipAmountUnits.toString(),
      gatewayFee: gatewayFee.toString(),
      gatewayFeeFormatted: ethers.formatUnits(gatewayFee, USD_DECIMALS),
    });

  // Generate unique pledge ID
  const pledgeId = ethers.keccak256(
    ethers.toUtf8Bytes(
      `pledge-${Date.now()}-${payment.user.address}-${payment.id}`,
    ),
  );

  debug && console.log('[Execute Gateway] Generated pledge ID:', { pledgeId });

  // Check current allowance
  const currentAllowance = await usdContract.allowance(
    adminSigner.address,
    payment.campaign.treasuryAddress,
  );

  debug &&
    console.log('[Execute Gateway] Current allowance:', {
      current: ethers.formatUnits(currentAllowance, USD_DECIMALS),
      required: pledgeAmount,
    });

  // CRITICAL: Only approve pledge amount, NOT tip
  // Tips stay in admin wallet
  if (currentAllowance < pledgeAmountUnits) {
    debug &&
      console.log('[Execute Gateway] Approving treasury for pledge amount');

    const approveTx = await usdContract.approve(
      payment.campaign.treasuryAddress,
      pledgeAmountUnits,
      {
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        maxFeePerGas: ethers.parseUnits('100', 'gwei'),
      },
    );

    debug &&
      console.log('[Execute Gateway] Approval transaction:', {
        hash: approveTx.hash,
      });

    await approveTx.wait();

    debug && console.log('[Execute Gateway] Approval confirmed');
  }

  // Get nonce for transaction ordering
  const nonce = await provider.getTransactionCount(
    adminSigner.address,
    'pending',
  );

  debug && console.log('[Execute Gateway] Using nonce:', nonce);

  // Execute setFeeAndPledge
  // IMPORTANT: Contract will transfer pledge amount from admin wallet to treasury
  // Tips remain in admin wallet
  debug && console.log('[Execute Gateway] Executing setFeeAndPledge');

  const tx = await treasuryContract.setFeeAndPledge(
    pledgeId,
    payment.user.address, // backer (NFT recipient)
    pledgeAmountUnits, // pledge amount only
    tipAmountUnits, // tip metadata (not transferred)
    gatewayFee, // 2% gateway fee
    [], // no rewards
    false, // isPledgeForAReward
    {
      nonce,
      maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
      maxFeePerGas: ethers.parseUnits('100', 'gwei'),
    },
  );

  debug &&
    console.log('[Execute Gateway] Transaction submitted:', {
      hash: tx.hash,
      from: adminSigner.address,
      to: payment.campaign.treasuryAddress,
    });

  // Wait for confirmation with timeout
  const receipt = await Promise.race([
    tx.wait(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Transaction timeout after 60s')), 60000),
    ),
  ]);

  debug &&
    console.log('[Execute Gateway] Transaction confirmed:', {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
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

  debug &&
    console.log('[Execute Gateway] Final admin wallet balance:', {
      before: adminBalanceFormatted,
      after: finalAdminBalanceFormatted,
      difference: (
        parseFloat(adminBalanceFormatted) -
        parseFloat(finalAdminBalanceFormatted)
      ).toFixed(6),
      expectedDifference: pledgeAmount,
      tipRemaining: tipAmount,
    });

  // Update payment metadata with execution details
  const executionMetadata: GatewayPledgeMetadata = {
    onChainPledgeId: pledgeId,
    treasuryTxHash: tx.hash,
    executionTimestamp: new Date().toISOString(),
    adminWalletBalanceBefore: adminBalanceFormatted,
    adminWalletBalanceAfter: finalAdminBalanceFormatted,
  };

  await db.payment.update({
    where: { id: payment.id },
    data: {
      metadata: {
        ...(payment.metadata as Record<string, unknown>),
        ...executionMetadata,
      },
    },
  });

  debug &&
    console.log('[Execute Gateway] Payment metadata updated:', {
      paymentId: payment.id,
      pledgeId,
    });

  const result: ExecuteGatewayPledgeResponse = {
    success: true,
    pledgeId,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber as number,
    pledgeAmount: pledgeAmount.toString(),
    tipAmount: tipAmount.toString(),
  };

  debug && console.log('[Execute Gateway] Execution complete:', result);

  return result;
}

