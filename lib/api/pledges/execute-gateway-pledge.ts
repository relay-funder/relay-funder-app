import { db } from '@/server/db';
import { ApiParameterError, ApiUpstreamError } from '@/lib/api/error';
import { ethers, erc20Abi } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { USD_ADDRESS, USD_DECIMALS } from '@/lib/constant';
import {
  NEXT_PUBLIC_PLATFORM_ADMIN,
  PLATFORM_ADMIN_PRIVATE_KEY,
  NEXT_PUBLIC_RPC_URL,
} from '@/lib/constant/server';
import { debugApi as debug } from '@/lib/debug';
import type {
  ExecuteGatewayPledgeResponse,
  GatewayPledgeMetadata,
} from '@/lib/api/types/pledges';

/**
 * Execute a gateway pledge using setFeeAndPledge.
 *
 * Token Flow:
 * - Admin wallet approves treasury for (pledgeAmount + tipAmount)
 * - Contract transfers both amounts to treasury via safeTransferFrom
 * - Tips tracked separately in contract state for later claiming
 * - User receives pledge NFT
 *
 * @param paymentId - Internal payment record ID
 * @returns Execution result with transaction hash and amounts
 * @throws ApiParameterError if payment invalid or already executed
 * @throws ApiUpstreamError if insufficient balance or transaction fails
 */
export async function executeGatewayPledge(
  paymentId: number,
): Promise<ExecuteGatewayPledgeResponse> {
  debug && console.log('[Execute Gateway] Starting pledge execution');

  // Load payment with related data
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      campaign: true,
    },
  });

  if (!payment) {
    throw new ApiParameterError(`Payment not found: ${paymentId.toString()}`);
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
      pledgeAmount: (metadata.pledgeAmount as string) || '0',
      tipAmount: (metadata.tipAmount as string) || '0',
    };
  }

  // Extract amounts from payment and parse to token units
  // Use bigint arithmetic to avoid floating-point precision issues
  const totalAmountUnits = ethers.parseUnits(payment.amount, USD_DECIMALS);
  const tipAmountUnits = ethers.parseUnits(
    (metadata?.tipAmount as string) || '0',
    USD_DECIMALS,
  );
  const pledgeAmountUnits = totalAmountUnits - tipAmountUnits;

  debug &&
    console.log('[Execute Gateway] Payment amounts:', {
      totalAmount: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
      pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
      tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
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
    console.error('[Execute Gateway] Missing environment variables', {
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
    throw new ApiParameterError(
      'Campaign does not have a treasury address configured',
    );
  }

  // Initialize provider and admin signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const adminSigner = new ethers.Wallet(adminPrivateKey, provider);

  // Verify private key matches public address
  if (adminSigner.address.toLowerCase() !== adminAddress.toLowerCase()) {
    console.error('[Execute Gateway] Admin address mismatch', {
      derivedFromKey: adminSigner.address,
      configured: adminAddress,
    });
    throw new ApiParameterError(
      'Admin private key does not match configured admin address',
    );
  }

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
      required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
      hasEnough: adminBalance >= totalAmountUnits,
    });

  if (adminBalance < totalAmountUnits) {
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

  debug &&
    console.log('[Execute Gateway] Calculated amounts:', {
      pledgeAmountUnits: pledgeAmountUnits.toString(),
      tipAmountUnits: tipAmountUnits.toString(),
      gatewayFee: gatewayFee.toString(),
      note: 'Using treasury configured fees only, no additional gateway fee',
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
      required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    });

  // Approve treasury for total amount if needed
  if (currentAllowance < totalAmountUnits) {
    debug &&
      console.log(
        '[Execute Gateway] Approving treasury for total amount (pledge + tip)',
      );

    const approveTx = await usdContract.approve(
      payment.campaign.treasuryAddress,
      totalAmountUnits,
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

  // Execute setFeeAndPledge - transfers pledge + tip to treasury
  debug && console.log('[Execute Gateway] Executing setFeeAndPledge');

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

  debug &&
    console.log('[Execute Gateway] Transaction submitted:', {
      hash: tx.hash,
      from: adminSigner.address,
      to: payment.campaign.treasuryAddress,
    });

  // Wait for confirmation
  const receipt = await tx.wait();

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
      difference: ethers.formatUnits(
        adminBalance - finalAdminBalance,
        USD_DECIMALS,
      ),
      expectedDifference: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
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
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
  };

  debug && console.log('[Execute Gateway] Execution complete:', result);

  return result;
}
