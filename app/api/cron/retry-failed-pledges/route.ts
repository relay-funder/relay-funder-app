import { db } from '@/server/db';
import { ApiAuthNotAllowed } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { retryGatewayPledge } from '@/lib/api/pledges/retry-gateway-execution';
import { logFactory } from '@/lib/debug';

const logInfo = logFactory('info', 'CronRetryPledges', { flag: 'cron' });
const logError = logFactory('error', 'CronRetryPledges', { flag: 'cron' });

/**
 * Maximum number of retry attempts before a payment is considered permanently failed.
 * After this many attempts, the payment will no longer be automatically retried
 * and requires manual admin intervention.
 */
const MAX_RETRY_ATTEMPTS = 10;

/**
 * Minimum time (in milliseconds) that must pass since the last attempt
 * before a payment is eligible for automatic retry. This prevents rapid
 * retry loops and allows transient issues to resolve.
 */
const MIN_RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Maximum number of payments to process per cron run.
 * This is kept low to stay within Vercel's 60-second timeout for cron jobs.
 * Processing is done sequentially to avoid overwhelming the blockchain RPC.
 */
const MAX_PAYMENTS_PER_RUN = 5;

/**
 * GET /api/cron/retry-failed-pledges
 *
 * Vercel Cron Job endpoint to automatically retry failed pledge executions.
 * This endpoint runs every 15 minutes and processes payments that:
 * - Have pledgeExecutionStatus = FAILED
 * - Have fewer than MAX_RETRY_ATTEMPTS attempts
 * - Have not been attempted in the last MIN_RETRY_INTERVAL_MS
 * - Have status = confirmed (payment was received)
 * - Do NOT have a pledgeExecutionTxHash (those need manual review)
 *
 * Security: Requires CRON_SECRET in Authorization header (Vercel provides this)
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      logError('CRON_SECRET environment variable is not configured');
      throw new ApiAuthNotAllowed('Cron endpoint not configured');
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logError('Invalid or missing authorization header for cron request');
      throw new ApiAuthNotAllowed('Unauthorized cron request');
    }

    logInfo('Starting automatic retry of failed pledges');

    // Calculate the cutoff time for eligible payments
    const retryEligibleBefore = new Date(Date.now() - MIN_RETRY_INTERVAL_MS);

    // Query for eligible failed payments
    const eligiblePayments = await db.payment.findMany({
      where: {
        // Only FAILED payments (not PENDING, SUCCESS, or NOT_STARTED)
        pledgeExecutionStatus: 'FAILED',
        // Must be a Daimo payment
        provider: 'daimo',
        // Payment must be confirmed (funds received)
        status: 'confirmed',
        // Under the retry limit
        pledgeExecutionAttempts: {
          lt: MAX_RETRY_ATTEMPTS,
        },
        // No transaction hash (payments with tx hash need manual review)
        pledgeExecutionTxHash: null,
        // Enough time has passed since last attempt
        OR: [
          { pledgeExecutionLastAttempt: null },
          { pledgeExecutionLastAttempt: { lt: retryEligibleBefore } },
        ],
      },
      select: {
        id: true,
        daimoPaymentId: true,
        pledgeExecutionAttempts: true,
        pledgeExecutionLastAttempt: true,
        pledgeExecutionError: true,
        amount: true,
        campaignId: true,
      },
      orderBy: [
        // Prioritize payments with fewer attempts (newer failures)
        { pledgeExecutionAttempts: 'asc' },
        // Then by oldest last attempt
        { pledgeExecutionLastAttempt: 'asc' },
      ],
      take: MAX_PAYMENTS_PER_RUN,
    });

    logInfo('Found eligible payments for retry', {
      count: eligiblePayments.length,
      maxPerRun: MAX_PAYMENTS_PER_RUN,
    });

    if (eligiblePayments.length === 0) {
      return response({
        success: true,
        message: 'No failed pledges eligible for retry',
        processed: 0,
        results: [],
      });
    }

    // Process payments sequentially to avoid overloading the RPC
    const results: Array<{
      paymentId: number;
      success: boolean;
      error?: string;
    }> = [];

    for (const payment of eligiblePayments) {
      logInfo('Retrying failed pledge', {
        paymentId: payment.id,
        daimoPaymentId: payment.daimoPaymentId,
        attempt: payment.pledgeExecutionAttempts + 1,
        previousError: payment.pledgeExecutionError,
      });

      try {
        const result = await retryGatewayPledge(payment.id);

        if (result.success) {
          logInfo('Pledge retry succeeded', {
            paymentId: payment.id,
            daimoPaymentId: payment.daimoPaymentId,
          });
          results.push({ paymentId: payment.id, success: true });
        } else {
          logError('Pledge retry failed', {
            paymentId: payment.id,
            daimoPaymentId: payment.daimoPaymentId,
            error: result.error,
          });
          results.push({
            paymentId: payment.id,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logError('Pledge retry threw exception', {
          paymentId: payment.id,
          daimoPaymentId: payment.daimoPaymentId,
          error: errorMessage,
        });
        results.push({
          paymentId: payment.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    logInfo('Cron job completed', {
      processed: results.length,
      succeeded: successCount,
      failed: failureCount,
    });

    return response({
      success: true,
      message: `Processed ${results.length} failed pledges: ${successCount} succeeded, ${failureCount} failed`,
      processed: results.length,
      succeeded: successCount,
      failed: failureCount,
      results,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
