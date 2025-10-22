import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getUser } from '@/lib/api/user';
import { getCampaignForPayment } from '@/lib/api/campaigns';
import {
  PatchPaymentBodyRouteSchema,
  PostPaymentBodyRouteSchema,
} from '@/lib/api/types/campaigns/payments';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const data = PostPaymentBodyRouteSchema.parse(await req.json());

    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    // Use email from request or fallback to user profile email
    const emailForPayment = data.userEmail || user.email;
    if (!emailForPayment || emailForPayment.trim() === '') {
      throw new ApiParameterError(
        'Email is required for donation. Please provide a valid email address.',
      );
    }

    const campaign = await getCampaignForPayment(data.campaignId);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    const creator = await getUser(campaign.creatorAddress);
    if (!creator) {
      throw new ApiNotFoundError('Campaign Creator not found');
    }

    const payment = await db.payment.create({
      data: {
        amount: data.amount,
        token: data.token,
        isAnonymous: data.isAnonymous,
        status: data.status,
        transactionHash: data.transactionHash,
        type: data.type ?? 'BUY',
        user: { connect: { id: user.id } },
        campaign: { connect: { id: campaign.id } },
        provider: data.provider || null,
        metadata: {
          userEmail: emailForPayment,
        },
      },
    });

    // create roundContribution
    if (Array.isArray(campaign.rounds)) {
      for (const round of campaign.rounds) {
        if (typeof round.roundCampaignId !== 'number') continue;

        // Check if round is active (approved and within date range)
        if (
          round.status !== 'APPROVED' ||
          !round.startTime ||
          !round.endTime ||
          new Date() < new Date(round.startTime) ||
          new Date() > new Date(round.endTime)
        ) {
          continue;
        }

        try {
          await db.roundContribution.create({
            data: {
              campaign: { connect: { id: campaign.id } },
              roundCampaign: { connect: { id: round.roundCampaignId } },
              payment: { connect: { id: payment.id } },
              humanityScore: user.humanityScore,
            },
          });
        } catch (roundError) {
          console.error('Failed to create round contribution:', roundError);
          // Don't throw - round contributions are optional
        }
      }
    }
    // Fetch payment with user for notification
    const paymentWithUser = await db.payment.findUnique({
      where: { id: payment.id },
      include: { user: true },
    });
    if (!paymentWithUser) {
      throw new ApiNotFoundError('Payment not found');
    }

    // Send notification (don't fail payment creation if notification fails)
    try {
      const numericAmount = parseFloat(paymentWithUser.amount);
      const formattedAmount = formatCrypto(
        numericAmount,
        paymentWithUser.token,
      );
      const donorName = paymentWithUser.isAnonymous
        ? 'anon'
        : getUserNameFromInstance(paymentWithUser.user) ||
          paymentWithUser.user?.address ||
          'unknown';
      await notify({
        receiverId: creator.id,
        creatorId: user.id,
        data: {
          type: 'CampaignPayment',
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          paymentId: payment.id,
          formattedAmount,
          donorName,
        },
      });
    } catch (notificationError) {
      console.error('Failed to send payment notification:', notificationError);
      // Don't throw - notification failure shouldn't fail payment creation
    }
    return response({ paymentId: payment.id });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const data = PatchPaymentBodyRouteSchema.parse(await req.json());

    // Get user consistently the same way as in POST route
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    const instance = await db.payment.findUnique({
      where: { id: data.paymentId },
    });
    if (!instance) {
      throw new ApiNotFoundError('Payment not found');
    }
    if (instance.userId !== user.id) {
      throw new ApiAuthNotAllowed('Session not allowed to modify this payment');
    }
    const payment = await db.payment.update({
      where: { id: data.paymentId },
      data: {
        status: data.status,
        ...(data.transactionHash && { transactionHash: data.transactionHash }),
      },
    });

    return response({ payment, campaignId: instance.campaignId });
  } catch (error: unknown) {
    return handleError(error);
  }
}
