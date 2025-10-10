import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';
import { DAIMO_PAY_WEBHOOK_SECRET } from '@/lib/constant';
import { DaimoPayWebhookPayloadSchema } from '@/lib/api/types/webhooks';
import { debugApi as debug } from '@/lib/debug';

export async function POST(req: Request) {
  try {
    // Verify Daimo Pay webhook authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.warn(
        'Daimo Pay webhook: Missing or invalid Authorization header',
      );
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(6); // Remove 'Basic ' prefix
    if (token !== DAIMO_PAY_WEBHOOK_SECRET) {
      console.warn('Daimo Pay webhook: Invalid webhook secret token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawPayload = await req.json();
    const payload = DaimoPayWebhookPayloadSchema.parse(rawPayload);

    debug &&
      console.log('Daimo Pay webhook received:', {
        type: payload.type,
        paymentId: payload.paymentId,
        isTestEvent: payload.isTestEvent,
        paymentStatus: payload.payment?.status,
      });

    // Skip processing test events (but acknowledge them)
    if (payload.isTestEvent) {
      debug &&
        console.log('Test event received, acknowledging without processing');
      return response({
        acknowledged: true,
        message: 'Test event acknowledged',
      });
    }

    // Validate required fields
    if (!payload.paymentId) {
      throw new ApiParameterError('Missing paymentId in webhook payload');
    }

    if (!payload.payment?.id) {
      throw new ApiParameterError('Missing payment.id in webhook payload');
    }

    if (!payload.type) {
      throw new ApiParameterError('Missing type in webhook payload');
    }

    // Find payment by transaction hash (which we set to the Daimo payment ID)
    const payment = await db.payment.findFirst({
      where: {
        transactionHash: payload.paymentId,
      },
      include: {
        user: true,
        campaign: true,
      },
    });

    if (!payment) {
      console.warn(
        'Payment not found for Daimo Pay webhook:',
        payload.paymentId,
      );
      // Return 200 to acknowledge webhook even if payment not found
      // This prevents Daimo Pay from retrying indefinitely
      return response({ acknowledged: true, message: 'Payment not found' });
    }

    // Map Daimo Pay status to our internal status
    // Based on webhook documentation, we use the payment.status field
    let newStatus: string;
    const daimoStatus = payload.payment.status;

    switch (daimoStatus) {
      case 'payment_completed':
        newStatus = 'confirmed';
        break;
      case 'payment_bounced':
      case 'payment_refunded':
        newStatus = 'failed';
        break;
      case 'payment_started':
      default:
        newStatus = 'confirming';
        break;
    }

    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
      },
      include: {
        user: true,
        campaign: true,
      },
    });

    debug &&
      console.log(`Payment ${payment.id} status updated to ${newStatus}`);

    // If payment is confirmed, send notification (pledge already recorded via toCallData)
    if (newStatus === 'confirmed' && payment.campaign.creatorAddress) {
      try {
        const creator = await db.user.findUnique({
          where: { address: payment.campaign.creatorAddress },
        });

        if (creator) {
          const numericAmount = parseFloat(updatedPayment.amount);
          const formattedAmount = formatCrypto(
            numericAmount,
            updatedPayment.token,
          );
          const donorName = updatedPayment.isAnonymous
            ? 'anon'
            : getUserNameFromInstance(updatedPayment.user) ||
              updatedPayment.user?.address ||
              'unknown';

          await notify({
            receiverId: creator.id,
            creatorId: updatedPayment.userId,
            data: {
              type: 'CampaignPayment',
              campaignId: payment.campaignId,
              campaignTitle: payment.campaign.title,
              paymentId: updatedPayment.id,
              formattedAmount,
              donorName,
            },
          });

          debug &&
            console.log(
              `Notification sent for Daimo Pay payment ${updatedPayment.id}`,
            );
        }
      } catch (notificationError) {
        console.error(
          'Error sending Daimo Pay notification:',
          notificationError,
        );
        // Don't fail the webhook because of notification errors
      }
    }

    debug &&
      console.log(
        `Payment ${payment.id} status updated to ${newStatus} via ${payload.type} event`,
      );

    return response({
      acknowledged: true,
      paymentId: payment.id,
      daimoPaymentId: payload.paymentId,
      eventType: payload.type,
      status: newStatus,
    });
  } catch (error: unknown) {
    console.error('Daimo Pay webhook error:', error);
    return handleError(error);
  }
}
