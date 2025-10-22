import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getUser } from '@/lib/api/user';
import { getCampaign } from '@/lib/api/campaigns';
import { roundIsActive } from '@/lib/api/rounds';
import {
  PatchPaymentBodyRouteSchema,
  PostPaymentBodyRouteSchema,
} from '@/lib/api/types/campaigns/payments';
import { notify } from '@/lib/api/event-feed';
import { getUserNameFromInstance } from '@/lib/api/user';
import { formatCrypto } from '@/lib/format-crypto';

export async function POST(req: Request) {
  try {
    console.log('🚀 Payment API: POST request received');
    const session = await checkAuth(['user']);
    console.log(
      '✅ Payment API: Authentication passed for user:',
      session.user.address,
    );
    const data = PostPaymentBodyRouteSchema.parse(await req.json());
    console.log('✅ Payment API: Request data validated:', {
      amount: data.amount,
      transactionHash: data.transactionHash,
      campaignId: data.campaignId,
    });

    const user = await getUser(session.user.address);
    if (!user) {
      console.error(
        '🚨 Payment API: User not found for address:',
        session.user.address,
      );
      throw new ApiNotFoundError('User not found');
    }
    console.log('✅ Payment API: User found:', user.id);

    // Use email from request or fallback to user profile email
    const emailForPayment = data.userEmail || user.email;
    if (!emailForPayment || emailForPayment.trim() === '') {
      console.error(
        '🚨 Payment API: Email validation failed - no email provided',
      );
      throw new ApiParameterError(
        'Email is required for donation. Please provide a valid email address.',
      );
    }
    console.log('✅ Payment API: Email validated:', emailForPayment);

    const campaign = await getCampaign(data.campaignId);
    if (!campaign) {
      console.error(
        '🚨 Payment API: Campaign not found for ID:',
        data.campaignId,
      );
      throw new ApiNotFoundError('Campaign not found');
    }
    console.log('✅ Payment API: Campaign found:', campaign.id);

    const creator = await getUser(campaign.creatorAddress);
    if (!creator) {
      console.error(
        '🚨 Payment API: Campaign creator not found for address:',
        campaign.creatorAddress,
      );
      throw new ApiNotFoundError('Campaign Creator not found');
    }
    console.log('✅ Payment API: Creator found:', creator.id);
    console.log('💾 Creating payment record:', {
      amount: data.amount,
      token: data.token,
      transactionHash: data.transactionHash,
      userId: user.id,
      campaignId: campaign.id,
      emailForPayment,
    });

    let payment;
    try {
      payment = await db.payment.create({
        data: {
          amount: data.amount,
          token: data.token,
          isAnonymous: data.isAnonymous,
          status: data.status,
          transactionHash: data.transactionHash,
          type: data.type ?? 'BUY',
          user: { connect: { id: user.id } },
          campaign: { connect: { id: campaign.id } },
          metadata: {
            userEmail: emailForPayment,
          },
        },
      });
    } catch (dbError) {
      console.error(
        '🚨 Payment API: Database error during payment creation:',
        dbError,
      );
      throw dbError;
    }

    console.log('✅ Payment record created successfully:', {
      id: payment.id,
      transactionHash: payment.transactionHash,
      status: payment.status,
      createdAt: payment.createdAt,
    });
    // create roundContribution
    console.log(
      '📊 Creating round contributions for campaign rounds:',
      campaign.rounds?.length || 0,
    );
    if (Array.isArray(campaign.rounds)) {
      for (const round of campaign.rounds) {
        if (typeof round.roundCampaignId !== 'number') {
          console.log('⏭️ Skipping round - invalid roundCampaignId:', round);
          continue;
        }
        if (!roundIsActive(round)) {
          console.log('⏭️ Skipping round - not active:', round.roundCampaignId);
          continue;
        }
        console.log(
          '📝 Creating round contribution for round:',
          round.roundCampaignId,
        );
        try {
          await db.roundContribution.create({
            data: {
              campaign: { connect: { id: campaign.id } },
              roundCampaign: { connect: { id: round.roundCampaignId } },
              payment: { connect: { id: payment.id } },
              humanityScore: user.humanityScore,
            },
          });
          console.log(
            '✅ Round contribution created for round:',
            round.roundCampaignId,
          );
        } catch (roundError) {
          console.error('🚨 Failed to create round contribution:', roundError);
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
    console.log('📢 Sending payment notification');
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
      console.log('✅ Payment notification sent successfully');
    } catch (notificationError) {
      console.error(
        '🚨 Failed to send payment notification:',
        notificationError,
      );
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
