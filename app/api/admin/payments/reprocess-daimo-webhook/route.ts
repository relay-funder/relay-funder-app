import { checkAuth } from '@/lib/api/auth';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { ReprocessDaimoWebhookSchema } from '@/lib/api/types/admin';
import { DAIMO_PAY_WEBHOOK_SECRET } from '@/lib/constant/server';
import { db } from '@/server/db';
import { POST as handleDaimoWebhook } from '@/app/api/webhooks/daimo-pay/route';

export async function POST(req: Request) {
  try {
    await checkAuth(['admin']);

    const body = await req.json();
    const input = ReprocessDaimoWebhookSchema.parse(body);

    let targetDaimoPaymentId = input.daimoPaymentId;
    let webhookEvent =
      input.eventId !== undefined
        ? await db.daimoWebhookEvent.findUnique({
            where: { id: input.eventId },
          })
        : null;

    if (!webhookEvent && input.paymentId) {
      const payment = await db.payment.findUnique({
        where: { id: input.paymentId },
        select: { daimoPaymentId: true },
      });

      if (!payment?.daimoPaymentId) {
        throw new ApiNotFoundError(
          `Payment ${input.paymentId} not found or missing daimoPaymentId`,
        );
      }

      targetDaimoPaymentId = payment.daimoPaymentId;
    }

    if (!webhookEvent && targetDaimoPaymentId) {
      webhookEvent = await db.daimoWebhookEvent.findFirst({
        where: {
          daimoPaymentId: targetDaimoPaymentId,
          eventType: 'payment_completed',
        },
        orderBy: { receivedAt: 'desc' },
      });
    }

    if (!webhookEvent && targetDaimoPaymentId) {
      webhookEvent = await db.daimoWebhookEvent.findFirst({
        where: { daimoPaymentId: targetDaimoPaymentId },
        orderBy: { receivedAt: 'desc' },
      });
    }

    if (!webhookEvent) {
      throw new ApiNotFoundError('No stored Daimo webhook event found');
    }

    if (input.dryRun) {
      return response({
        dryRun: true,
        event: {
          id: webhookEvent.id,
          daimoPaymentId: webhookEvent.daimoPaymentId,
          eventType: webhookEvent.eventType,
          paymentStatus: webhookEvent.paymentStatus,
          receivedAt: webhookEvent.receivedAt,
          processingStatus: webhookEvent.processingStatus,
          processedAt: webhookEvent.processedAt,
        },
      });
    }

    if (!DAIMO_PAY_WEBHOOK_SECRET) {
      throw new ApiParameterError(
        'DAIMO_PAY_WEBHOOK_SECRET is missing; cannot replay webhook',
      );
    }

    const replayHeaders = new Headers({
      'content-type': 'application/json',
      authorization: `Basic ${DAIMO_PAY_WEBHOOK_SECRET}`,
    });

    if (webhookEvent.idempotencyKey) {
      replayHeaders.set('idempotency-key', webhookEvent.idempotencyKey);
    }

    const replayRequest = new Request(
      'http://localhost/api/webhooks/daimo-pay',
      {
        method: 'POST',
        headers: replayHeaders,
        body: JSON.stringify(webhookEvent.payload),
      },
    );

    const replayResponse = await handleDaimoWebhook(replayRequest);
    const replayBody = await replayResponse.json();
    const replaySuccess = replayResponse.status < 400;

    await db.daimoWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processingStatus: replaySuccess ? 'REPLAYED' : 'FAILED',
        processingError: replaySuccess
          ? null
          : `Replay failed with status ${replayResponse.status}`,
        processedAt: new Date(),
      },
    });

    return response({
      replayed: true,
      status: replayResponse.status,
      body: replayBody,
      eventId: webhookEvent.id,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
