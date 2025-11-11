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

const logVerbose = logFactory('verbose', '🚀 DaimoRetryPledge', { flag: 'daimo' });

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

    // Validate pledge execution status is retryable
    const retryableStatuses: PledgeExecutionStatus[] = [
      'FAILED',
      'NOT_STARTED',
    ];
    if (!retryableStatuses.includes(payment.pledgeExecutionStatus)) {
      logError(
        'Payment not eligible for retry - non-retryable pledge status:',
        {
          prefixId,
          logAddress,
          paymentId,
          status: payment.status,
          provider: payment.provider,
          pledgeExecutionStatus: payment.pledgeExecutionStatus,
          attempts: payment.pledgeExecutionAttempts,
        },
      );
      throw new ApiParameterError(
        `Payment pledge execution status must be FAILED or NOT_STARTED to retry. Current status: ${payment.pledgeExecutionStatus}`,
      );
    }

    logVerbose('Payment eligible for retry:', {
      prefixId,
      logAddress,
      paymentId,
      status: payment.status,
      provider: payment.provider,
      pledgeExecutionStatus: payment.pledgeExecutionStatus,
      attempts: payment.pledgeExecutionAttempts,
    });

    // Execute retry
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
