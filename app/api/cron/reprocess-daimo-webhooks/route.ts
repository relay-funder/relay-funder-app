import { db } from '@/server/db';
import { ApiAuthNotAllowed } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { DAIMO_PAY_WEBHOOK_SECRET } from '@/lib/constant/server';
import { logFactory } from '@/lib/debug';
import { POST as handleDaimoWebhook } from '@/app/api/webhooks/daimo-pay/route';

const logInfo = logFactory('info', 'CronReplayDaimo', { flag: 'cron' });
const logError = logFactory('error', 'CronReplayDaimo', { flag: 'cron' });

const MIN_CONFIRMING_AGE_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PAYMENTS_PER_RUN = 10;

/**
 * GET /api/cron/reprocess-daimo-webhooks
 *
 * Replays stored Daimo webhooks for payments stuck in confirming.
 * Security: Requires CRON_SECRET in Authorization header (Vercel provides this)
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Debug logging to diagnose env var issue
    logInfo('Cron auth debug', {
      hasCronSecret: !!cronSecret,
      cronSecretLength: cronSecret?.length ?? 0,
      cronSecretPrefix: cronSecret?.substring(0, 4) ?? 'N/A',
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 10) ?? 'N/A',
    });

    if (!cronSecret) {
      logError('CRON_SECRET environment variable is not configured');
      throw new ApiAuthNotAllowed('Cron endpoint not configured');
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logError('Invalid or missing authorization header for cron request');
      throw new ApiAuthNotAllowed('Unauthorized cron request');
    }

    if (!DAIMO_PAY_WEBHOOK_SECRET) {
      logError('DAIMO_PAY_WEBHOOK_SECRET is missing; cannot replay webhooks');
      throw new ApiAuthNotAllowed('Webhook replay not configured');
    }

    const confirmingBefore = new Date(Date.now() - MIN_CONFIRMING_AGE_MS);

    const stuckPayments = await db.payment.findMany({
      where: {
        provider: 'daimo',
        status: 'confirming',
        updatedAt: { lt: confirmingBefore },
        daimoPaymentId: { not: null },
      },
      select: {
        id: true,
        daimoPaymentId: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'asc' },
      take: MAX_PAYMENTS_PER_RUN,
    });

    logInfo('Found confirming Daimo payments for webhook replay', {
      count: stuckPayments.length,
      maxPerRun: MAX_PAYMENTS_PER_RUN,
    });

    if (stuckPayments.length === 0) {
      return response({
        success: true,
        message: 'No confirming Daimo payments eligible for replay',
        processed: 0,
        results: [],
      });
    }

    const results: Array<{
      paymentId: number;
      daimoPaymentId: string;
      success: boolean;
      error?: string;
      replayedEventId?: number;
    }> = [];

    for (const payment of stuckPayments) {
      const daimoPaymentId = payment.daimoPaymentId ?? '';
      logInfo('Replaying Daimo webhook for payment', {
        paymentId: payment.id,
        daimoPaymentId,
      });

      try {
        const completedEvent = await db.daimoWebhookEvent.findFirst({
          where: {
            daimoPaymentId,
            OR: [
              { eventType: 'payment_completed' },
              { paymentStatus: 'payment_completed' },
            ],
          },
          orderBy: { receivedAt: 'desc' },
        });

        const fallbackEvent =
          completedEvent ??
          (await db.daimoWebhookEvent.findFirst({
            where: { daimoPaymentId },
            orderBy: { receivedAt: 'desc' },
          }));

        if (!fallbackEvent) {
          logError('No stored webhook event found for payment', {
            paymentId: payment.id,
            daimoPaymentId,
          });
          results.push({
            paymentId: payment.id,
            daimoPaymentId,
            success: false,
            error: 'No stored webhook event found',
          });
          continue;
        }

        const replayHeaders = new Headers({
          'content-type': 'application/json',
          authorization: `Basic ${DAIMO_PAY_WEBHOOK_SECRET}`,
        });

        const replayRequest = new Request(
          'http://localhost/api/webhooks/daimo-pay',
          {
            method: 'POST',
            headers: replayHeaders,
            body: JSON.stringify(fallbackEvent.payload),
          },
        );

        const replayResponse = await handleDaimoWebhook(replayRequest);
        const replaySuccess = replayResponse.status < 400;
        const replayBody = await replayResponse.json();

        await db.daimoWebhookEvent.update({
          where: { id: fallbackEvent.id },
          data: {
            processingStatus: replaySuccess ? 'REPLAYED' : 'FAILED',
            processingError: replaySuccess
              ? null
              : `Replay failed with status ${replayResponse.status}`,
            processedAt: new Date(),
          },
        });

        results.push({
          paymentId: payment.id,
          daimoPaymentId,
          success: replaySuccess,
          error: replaySuccess ? undefined : replayBody?.error,
          replayedEventId: fallbackEvent.id,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logError('Webhook replay failed for payment', {
          paymentId: payment.id,
          daimoPaymentId,
          error: errorMessage,
        });
        results.push({
          paymentId: payment.id,
          daimoPaymentId,
          success: false,
          error: errorMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    logInfo('Cron replay job completed', {
      processed: results.length,
      succeeded: successCount,
      failed: failureCount,
    });

    return response({
      success: true,
      message: `Processed ${results.length} confirming payments: ${successCount} succeeded, ${failureCount} failed`,
      processed: results.length,
      succeeded: successCount,
      failed: failureCount,
      results,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
