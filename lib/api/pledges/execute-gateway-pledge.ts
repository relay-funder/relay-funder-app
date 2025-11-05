import { db, Prisma } from '@/server/db';
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

// Type for payment with includes (matches webhook type)
export type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    campaign: true;
  };
}>;

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
 * @param payment - Payment object with relations (user and campaign included)
 * @returns Execution result with transaction hash and amounts
 * @throws ApiParameterError if payment invalid or already executed
 * @throws ApiUpstreamError if insufficient balance or transaction fails
 */
export async function executeGatewayPledge(
  payment: PaymentWithRelations,
): Promise<ExecuteGatewayPledgeResponse> {
  console.log('GATEWAY PLEDGE: Starting execution for payment:', payment.id);
  debug && console.log('[Execute Gateway] Starting pledge execution');

  console.log('GATEWAY PLEDGE: Validating payment status...');

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
    console.log('GATEWAY PLEDGE: Pledge already executed, returning cached result');
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
  
  console.log('GATEWAY PLEDGE: Payment validation complete, calculating amounts...');

  // Extract amounts from payment and parse to token units
  // payment.amount contains ONLY the pledge amount (matching direct wallet flow)
  // Tip is stored separately in metadata
  const pledgeAmountUnits = ethers.parseUnits(payment.amount, USD_DECIMALS);
  const tipAmountUnits = ethers.parseUnits(
    (metadata?.tipAmount as string) || '0',
    USD_DECIMALS,
  );
  const totalAmountUnits = pledgeAmountUnits + tipAmountUnits;

  console.log('GATEWAY PLEDGE: Amount calculation breakdown:', {
    paymentAmount: payment.amount,
    metadataTipAmount: (metadata?.tipAmount as string) || '0',
    metadataPledgeAmount: (metadata?.pledgeAmount as string) || 'N/A',
    metadataTotalReceived: (metadata?.totalReceivedFromDaimo as string) || 'N/A',
    calculatedPledgeUnits: pledgeAmountUnits.toString(),
    calculatedTipUnits: tipAmountUnits.toString(),
    calculatedTotalUnits: totalAmountUnits.toString(),
    formattedPledge: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    formattedTip: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    formattedTotal: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
  });
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

  console.log('GATEWAY PLEDGE: Initializing RPC provider and signer...');
  
  // Initialize provider and admin signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const adminSigner = new ethers.Wallet(adminPrivateKey, provider);

  console.log('GATEWAY PLEDGE: RPC provider initialized');

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
  
  console.log('GATEWAY PLEDGE: Admin signer verified');

  debug &&
    console.log('[Execute Gateway] Admin wallet:', {
      address: adminSigner.address,
      treasuryAddress: payment.campaign.treasuryAddress,
    });

  console.log('GATEWAY PLEDGE: Initializing contracts...');
  
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

  console.log('GATEWAY PLEDGE: Contracts initialized, checking admin wallet balance...');

  // Check admin wallet balance
  let adminBalance;
  try {
    adminBalance = await usdContract.balanceOf(adminSigner.address);
    console.log('GATEWAY PLEDGE: Admin balance retrieved successfully');
  } catch (rpcError) {
    console.error('GATEWAY PLEDGE: Failed to get admin balance from RPC:', rpcError);
    throw new ApiUpstreamError(
      `Failed to connect to blockchain RPC: ${rpcError instanceof Error ? rpcError.message : 'Unknown error'}`,
    );
  }
  const adminBalanceFormatted = ethers.formatUnits(adminBalance, USD_DECIMALS);

  console.log('GATEWAY PLEDGE: Admin wallet balance check:', {
    adminAddress: adminSigner.address,
    balance: adminBalanceFormatted,
    required: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    hasEnough: adminBalance >= totalAmountUnits,
  });
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

  console.log('GATEWAY PLEDGE: Processing amounts:', {
    totalReceived: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    gatewayFee: ethers.formatUnits(gatewayFee, USD_DECIMALS),
    treasuryAddress: payment.campaign.treasuryAddress,
    note: 'Both pledge and tip transferred to treasury. Tips tracked separately in contract for claiming.',
  });
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

  console.log('GATEWAY PLEDGE: Checking current allowance...');
  
  // Check current allowance
  const currentAllowance = await usdContract.allowance(
    adminSigner.address,
    payment.campaign.treasuryAddress,
  );

  console.log('GATEWAY PLEDGE: Current allowance:', {
    adminAddress: adminSigner.address,
    treasuryAddress: payment.campaign.treasuryAddress,
    currentAllowance: ethers.formatUnits(currentAllowance, USD_DECIMALS),
    requiredAllowance: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    needsApproval: currentAllowance < totalAmountUnits,
  });

  // Approve treasury for total amount if needed
  if (currentAllowance < totalAmountUnits) {
    console.log('GATEWAY PLEDGE: Submitting approval transaction...');

    try {
      const approveTx = await usdContract.approve(
        payment.campaign.treasuryAddress,
        totalAmountUnits,
        {
          maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
          maxFeePerGas: ethers.parseUnits('100', 'gwei'),
        },
      );

      console.log('GATEWAY PLEDGE: Approval transaction submitted:', {
        hash: approveTx.hash,
        nonce: approveTx.nonce,
        from: adminSigner.address,
        to: USD_ADDRESS,
        spender: payment.campaign.treasuryAddress,
        amount: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
      });

      console.log('GATEWAY PLEDGE: Waiting for approval confirmation...');

      // Wait for 1 confirmation
      const approvalReceipt = await approveTx.wait(1);

      if (!approvalReceipt || approvalReceipt.status !== 1) {
        throw new ApiUpstreamError(
          `Approval transaction failed. Hash: ${approveTx.hash}`,
        );
      }

      console.log('GATEWAY PLEDGE: Approval confirmed:', {
        hash: approveTx.hash,
        blockNumber: approvalReceipt.blockNumber,
        gasUsed: approvalReceipt.gasUsed?.toString(),
      });
    } catch (approvalError) {
      console.error('GATEWAY PLEDGE: Approval transaction error:', approvalError);
      throw new ApiUpstreamError(
        `Failed to approve treasury for token transfer: ${approvalError instanceof Error ? approvalError.message : 'Unknown error'}`,
      );
    }
  } else {
    console.log('GATEWAY PLEDGE: Existing allowance sufficient, skipping approval');
  }

  // Execute setFeeAndPledge - transfers pledge + tip to treasury
  debug && console.log('[Execute Gateway] Executing setFeeAndPledge');

  console.log('GATEWAY PLEDGE: setFeeAndPledge parameters:', {
    pledgeId,
    backer: payment.user.address,
    pledgeAmountUnits: pledgeAmountUnits.toString(),
    pledgeAmountFormatted: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmountUnits: tipAmountUnits.toString(),
    tipAmountFormatted: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    gatewayFee: gatewayFee.toString(),
    totalToTransfer: (pledgeAmountUnits + tipAmountUnits).toString(),
    totalToTransferFormatted: ethers.formatUnits(pledgeAmountUnits + tipAmountUnits, USD_DECIMALS),
    reward: '[]',
    isPledgeForAReward: false,
  });

  let tx: ethers.ContractTransactionResponse;
  let receipt: ethers.TransactionReceipt | null;

  try {
    tx = await treasuryContract.setFeeAndPledge(
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

    console.log('GATEWAY PLEDGE: Transaction submitted:', {
      hash: tx.hash,
      nonce: tx.nonce,
      from: adminSigner.address,
      to: payment.campaign.treasuryAddress,
      pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
      tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    });
    debug &&
      console.log('[Execute Gateway] Transaction submitted:', {
        hash: tx.hash,
        from: adminSigner.address,
        to: payment.campaign.treasuryAddress,
      });

    console.log('GATEWAY PLEDGE: Waiting for pledge transaction confirmation...');

    // Wait for 1 confirmation
    receipt = await tx.wait(1);

    if (!receipt) {
      throw new ApiUpstreamError(
        `No receipt received for pledge transaction. Hash: ${tx.hash}`,
      );
    }

    if (receipt.status !== 1) {
      throw new ApiUpstreamError(`Transaction reverted. Hash: ${tx.hash}`);
    }
  } catch (txError) {
    console.error('GATEWAY PLEDGE: Pledge transaction error:', txError);
    throw new ApiUpstreamError(
      `Failed to execute pledge transaction: ${txError instanceof Error ? txError.message : 'Unknown error'}`,
    );
  }

  console.log('GATEWAY PLEDGE: Transaction confirmed:', {
    hash: tx.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status ? 'SUCCESS' : 'FAILED',
    gasUsed: receipt.gasUsed?.toString(),
  });
  debug &&
    console.log('[Execute Gateway] Transaction confirmed:', {
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      gasUsed: receipt.gasUsed?.toString(),
    });

  // Get final admin wallet balance
  const finalAdminBalance = await usdContract.balanceOf(adminSigner.address);
  const finalAdminBalanceFormatted = ethers.formatUnits(
    finalAdminBalance,
    USD_DECIMALS,
  );

  console.log('GATEWAY PLEDGE: Final admin wallet balance:', {
    adminAddress: adminSigner.address,
    before: adminBalanceFormatted,
    after: finalAdminBalanceFormatted,
    totalSpent: ethers.formatUnits(adminBalance - finalAdminBalance, USD_DECIMALS),
    expectedSpent: ethers.formatUnits(totalAmountUnits, USD_DECIMALS),
    remaining: finalAdminBalanceFormatted,
  });
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
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
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

  console.log('GATEWAY PLEDGE: Execution complete:', {
    paymentId,
    pledgeId,
    transactionHash: tx.hash,
    pledgeAmount: ethers.formatUnits(pledgeAmountUnits, USD_DECIMALS),
    tipAmount: ethers.formatUnits(tipAmountUnits, USD_DECIMALS),
    adminWalletRemaining: finalAdminBalanceFormatted,
    treasuryAddress: payment.campaign.treasuryAddress,
  });
  debug && console.log('[Execute Gateway] Execution complete:', result);

  return result;
}
