import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiAuthNotAllowed, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getUser } from '@/lib/api/user';
import { getCampaign } from '@/lib/api/campaigns';
import { roundIsActive } from '@/lib/api/rounds';
import {
  PatchPaymentBodyRouteSchema,
  PostPaymentBodyRouteSchema,
} from '@/lib/api/types/campaigns/payments';
import { notify } from '@/lib/api/event-feed';

export async function POST(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const data = PostPaymentBodyRouteSchema.parse(await req.json());
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    const campaign = await getCampaign(data.campaignId);
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
      },
    });
    // create roundContribution
    if (Array.isArray(campaign.rounds)) {
      for (const round of campaign.rounds) {
        if (typeof round.roundCampaignId !== 'number') {
          continue;
        }
        if (!roundIsActive(round)) {
          continue;
        }
        await db.roundContribution.create({
          data: {
            campaign: { connect: { id: campaign.id } },
            roundCampaign: { connect: { id: round.roundCampaignId } },
            payment: { connect: { id: payment.id } },
            humanityScore: user.humanityScore,
          },
        });
      }
    }
    await notify({
      receiverId: creator.id,
      creatorId: user.id,
      type: 'CampaignPayment',
      message: `Payment of Received`,
      data: { campaignId: campaign.id },
    });
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
