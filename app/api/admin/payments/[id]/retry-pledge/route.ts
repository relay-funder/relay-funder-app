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

const logVerbose = logFactory('verbose', '🚀 DaimoRetryPledge', {
  flag: 'daimo',
});

const logError = logFactory('error', '🚨 DaimoRetryPledge', { flag: 'daimo' });

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

    // Prevent retry if transaction was already submitted on-chain
    // If we have a transaction hash, the pledge may have succeeded even if DB shows FAILED/PENDING
    // Require manual verification and admin override for these cases
    if (payment.pledgeExecutionTxHash) {
      logError(
        'Retry blocked: Transaction hash exists (pledge may have succeeded on-chain)',
        {
          prefixId,
          logAddress,
          paymentId,
          pledgeExecutionStatus: payment.pledgeExecutionStatus,
          pledgeExecutionTxHash: payment.pledgeExecutionTxHash,
          note: 'Verify transaction status on CeloScan before retrying',
        },
      );

      throw new ApiParameterError(
        `Payment ${paymentId} has transaction hash ${payment.pledgeExecutionTxHash}. ` +
          `Verify the transaction status on CeloScan. If transaction failed on-chain, ` +
          `clear the pledgeExecutionTxHash field in database before retrying. ` +
          `This safety check prevents accidental overpayment.`,
      );
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
