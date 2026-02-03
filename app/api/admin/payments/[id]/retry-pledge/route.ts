import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiNotFoundError,
  ApiParameterError,
  ApiUpstreamError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { retryGatewayPledge } from '@/lib/api/pledges/retry-gateway-execution';
import { db } from '@/server/db';
import { logFactory } from '@/lib/debug';
import type { PledgeExecutionStatus } from '@/server/db';
import { NEXT_PUBLIC_RPC_URL } from '@/lib/constant/server';
import { ethers } from '@/lib/web3';
import {
  waitWithTimeout,
  TIMEOUT_VALUES,
} from '@/lib/web3/transaction-timeout';
import { keccak256, toBytes } from 'viem';

const logVerbose = logFactory('verbose', '🚀 DaimoRetryPledge', {
  flag: 'daimo',
});

const logError = logFactory('error', '🚨 DaimoRetryPledge', { flag: 'daimo' });

type TxResolution = 'CONFIRMED_SUCCESS' | 'CONFIRMED_FAILED' | 'NOT_FOUND';

async function resolveCeloTxHash(
  txHash: string,
  { prefixId, logAddress }: { prefixId: string; logAddress: string },
): Promise<TxResolution> {
  const rpcUrl = NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) {
    logError('Missing NEXT_PUBLIC_RPC_URL; cannot verify pledge tx hash', {
      prefixId,
      logAddress,
      txHash,
    });
    throw new ApiParameterError(
      'Server configuration missing RPC URL; cannot verify pledge transaction',
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const receipt = await waitWithTimeout(
    provider.getTransactionReceipt(txHash),
    TIMEOUT_VALUES.READ_OPERATION,
    'read transaction receipt',
    { prefixId, logAddress, txHash },
  );

  if (!receipt) return 'NOT_FOUND';
  if (receipt.status === 1) return 'CONFIRMED_SUCCESS';
  return 'CONFIRMED_FAILED';
}

function computeDeterministicPledgeId(input: {
  treasuryAddress: string;
  userAddress: string;
  paymentId: number;
}): string {
  return keccak256(
    toBytes(
      `pledge-${input.treasuryAddress}-${input.userAddress}-${input.paymentId}`,
    ),
  );
}

/**
 * POST /api/admin/payments/[id]/retry-pledge
 *
 * Retry pledge execution for a Daimo Pay payment that failed or was not executed.
 * Admin-only endpoint for manual intervention.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Require admin authentication
    await checkAuth(['admin']);

    const { id: paymentIdStr } = await params;
    const paymentId = parseInt(paymentIdStr, 10);

    if (isNaN(paymentId)) {
      throw new ApiParameterError('Invalid payment ID');
    }

    logVerbose('Retry pledge request for payment:', {
      paymentId,
    });

    // Verify payment exists and is eligible for retry
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        campaign: true,
        user: true,
      },
    });

    if (!payment) {
      throw new ApiNotFoundError(`Payment ${paymentId} not found`);
    }
    const prefixId = `${payment?.daimoPaymentId}/${paymentIdStr}`;
    const logAddress = payment?.user.address;

    logVerbose('Payment found:', {
      prefixId,
      logAddress,
      paymentId,
      status: payment.status,
      provider: payment.provider,
      pledgeExecutionStatus: payment.pledgeExecutionStatus,
      attempts: payment.pledgeExecutionAttempts,
    });

    if (payment.provider !== 'daimo') {
      throw new ApiParameterError(
        'Only Daimo Pay payments can be retried via this endpoint',
      );
    }

    if (payment.status !== 'confirmed') {
      throw new ApiParameterError(
        `Payment must be confirmed before retry. Current status: ${payment.status}`,
      );
    }

    if (!payment.campaign.treasuryAddress) {
      throw new ApiParameterError(
        `Campaign ${payment.campaign.id} is missing treasuryAddress; cannot execute/reconcile pledge`,
      );
    }

    // Prevent retry if pledge execution already succeeded
    if (payment.pledgeExecutionStatus === 'SUCCESS') {
      logError('Retry blocked: Payment already has SUCCESS status', {
        prefixId,
        logAddress,
        paymentId,
        pledgeExecutionStatus: payment.pledgeExecutionStatus,
        pledgeExecutionTxHash: payment.pledgeExecutionTxHash,
      });

      throw new ApiParameterError(
        `Payment ${paymentId} already has SUCCESS status. Retry not allowed to prevent overpayment.`,
      );
    }

    // If a pledge tx hash exists, reconcile it BEFORE attempting a retry.
    // This avoids overpayment while still letting admins "fix" stuck records.
    if (payment.pledgeExecutionTxHash) {
      const txHash = payment.pledgeExecutionTxHash;

      logVerbose('Pledge tx hash present; reconciling on-chain status', {
        prefixId,
        logAddress,
        paymentId,
        pledgeExecutionStatus: payment.pledgeExecutionStatus,
        pledgeExecutionTxHash: txHash,
      });

      const txResolution = await resolveCeloTxHash(txHash, {
        prefixId,
        logAddress,
      });

      if (txResolution === 'CONFIRMED_SUCCESS') {
        const existingMetadata =
          (payment.metadata as Record<string, unknown>) || {};
        const deterministicPledgeId =
          typeof existingMetadata.generatedPledgeId === 'string'
            ? existingMetadata.generatedPledgeId
            : computeDeterministicPledgeId({
                treasuryAddress: payment.campaign.treasuryAddress,
                userAddress: payment.user.address,
                paymentId: payment.id,
              });

        await db.payment.update({
          where: { id: payment.id },
          data: {
            pledgeExecutionStatus: 'SUCCESS',
            pledgeExecutionError: null,
            metadata: {
              ...existingMetadata,
              onChainPledgeId:
                (existingMetadata.onChainPledgeId as string | undefined) ??
                deterministicPledgeId,
              treasuryTxHash:
                (existingMetadata.treasuryTxHash as string | undefined) ??
                txHash,
              reconciledFromPledgeExecutionTxHash: txHash,
              reconciledAt: new Date().toISOString(),
            },
          },
        });

        return response({
          success: true,
          paymentId,
          message:
            'Pledge already executed on-chain; reconciled database record without retrying.',
          pledgeExecutionTxHash: txHash,
        });
      }

      if (txResolution === 'CONFIRMED_FAILED') {
        const existingMetadata =
          (payment.metadata as Record<string, unknown>) || {};
        const previous =
          Array.isArray(existingMetadata.previousPledgeExecutionTxHashes) &&
          existingMetadata.previousPledgeExecutionTxHashes.every(
            (v) => typeof v === 'string',
          )
            ? (existingMetadata.previousPledgeExecutionTxHashes as string[])
            : [];

        await db.payment.update({
          where: { id: payment.id },
          data: {
            pledgeExecutionStatus: 'FAILED',
            pledgeExecutionError: `Previous pledge transaction reverted: ${txHash}`,
            pledgeExecutionTxHash: null,
            metadata: {
              ...existingMetadata,
              previousPledgeExecutionTxHashes: Array.from(
                new Set([...previous, txHash]),
              ),
              lastFailedPledgeExecutionTxHash: txHash,
              lastFailedPledgeExecutionTxCheckedAt: new Date().toISOString(),
            },
          },
        });

        logVerbose(
          'Previous pledge tx confirmed failed; cleared tx hash and proceeding with retry',
          { prefixId, logAddress, paymentId, pledgeExecutionTxHash: txHash },
        );
      } else if (txResolution === 'NOT_FOUND') {
        return NextResponse.json(
          {
            success: false,
            error: 'Pledge transaction not found on-chain yet',
            message:
              'This payment has a pledge tx hash, but it is not yet indexed/finalized via RPC. Retry is blocked to prevent overpayment; try again later.',
            paymentId,
            pledgeExecutionTxHash: txHash,
          },
          { status: 409 },
        );
      }
    }

    // Validate pledge execution status is retryable
    // Allow retry for:
    // 1. FAILED or NOT_STARTED (only if no tx hash exists)
    // 2. PENDING payments that are stuck (>10 minutes old) and have no tx hash
    const retryableStatuses: PledgeExecutionStatus[] = [
      'FAILED',
      'NOT_STARTED',
    ];

    const isStuckPending =
      payment.pledgeExecutionStatus === 'PENDING' &&
      payment.pledgeExecutionLastAttempt &&
      Date.now() - payment.pledgeExecutionLastAttempt.getTime() >
        10 * 60 * 1000; // 10 minutes

    const isRetryable =
      retryableStatuses.includes(payment.pledgeExecutionStatus) ||
      isStuckPending;

    if (!isRetryable) {
      const lastAttemptAgo = payment.pledgeExecutionLastAttempt
        ? Math.floor(
            (Date.now() - payment.pledgeExecutionLastAttempt.getTime()) / 1000,
          )
        : null;

      logError('Payment not eligible for retry:', {
        prefixId,
        logAddress,
        paymentId,
        status: payment.status,
        provider: payment.provider,
        pledgeExecutionStatus: payment.pledgeExecutionStatus,
        attempts: payment.pledgeExecutionAttempts,
        lastAttemptSecondsAgo: lastAttemptAgo,
        reason:
          payment.pledgeExecutionStatus === 'PENDING'
            ? 'PENDING but not stuck (< 10 minutes since last attempt)'
            : 'Status not retryable (must be FAILED, NOT_STARTED, or stuck PENDING)',
      });

      throw new ApiParameterError(
        `Payment not eligible for retry. Status: ${payment.pledgeExecutionStatus}` +
          (payment.pledgeExecutionStatus === 'PENDING' && lastAttemptAgo
            ? ` (last attempt ${lastAttemptAgo}s ago, need >600s to retry)`
            : '. Must be FAILED, NOT_STARTED, or stuck PENDING (>10 minutes)'),
      );
    }

    if (isStuckPending) {
      const stuckDurationMinutes = Math.floor(
        (Date.now() - payment.pledgeExecutionLastAttempt!.getTime()) /
          (60 * 1000),
      );

      logVerbose('Detected stuck PENDING payment, allowing retry:', {
        prefixId,
        logAddress,
        paymentId,
        pledgeExecutionStatus: payment.pledgeExecutionStatus,
        stuckDurationMinutes,
        attempts: payment.pledgeExecutionAttempts,
      });
    }

    logVerbose('Payment eligible for retry:', {
      prefixId,
      logAddress,
      paymentId,
      status: payment.status,
      provider: payment.provider,
      pledgeExecutionStatus: payment.pledgeExecutionStatus,
      attempts: payment.pledgeExecutionAttempts,
      note: 'Retry includes on-chain verification to prevent duplicate execution',
    });

    // Execute retry with on-chain verification
    // The retryGatewayPledge/executeGatewayPledge function includes
    // on-chain verification to prevent duplicate execution
    const result = await retryGatewayPledge(paymentId);

    if (result.success) {
      logVerbose('Pledge retry successful:', {
        prefixId,
        logAddress,
        paymentId,
        result,
      });
      return response({
        success: true,
        paymentId,
        message: 'Pledge execution retry successful',
        result: result.result,
      });
    } else {
      logError('Pledge retry failed:', {
        prefixId,
        logAddress,
        paymentId,
        result,
      });
      // Throw error to be handled by handleError with proper status code
      throw new ApiUpstreamError(
        `Pledge execution retry failed: ${result.error}`,
      );
    }
  } catch (error: unknown) {
    return handleError(error);
  }
}
