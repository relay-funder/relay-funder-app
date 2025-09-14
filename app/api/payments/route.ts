import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiAuthNotAllowed, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { z } from 'zod';
import { getUser } from '@/lib/api/user';
import { getCampaign } from '@/lib/api/campaigns';
import { roundIsActive } from '@/lib/api/rounds';

export const PostPaymentBodyRouteSchema = z.object({
  amount: z.string(),
  token: z.string(),
  isAnonymous: z.boolean(),
  type: z.enum(['SELL', 'BUY']),
  status: z.enum(['confirming']),
  transactionHash: z.string(),
  campaignId: z.number(),
});
export const PatchPaymentBodyRouteSchema = z.object({
  status: z.enum(['confirmed', 'failed']),
  transactionHash: z.string(),
});

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
    return response({ paymentId: payment.id });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await checkAuth(['user']);
    const data = await req.json();

    const instance = await db.payment.findUnique({
      where: { id: data.paymentId },
    });
    if (!instance) {
      throw new ApiNotFoundError('Payment not found');
    }
    if (instance.userId !== session.user.dbId) {
      throw new ApiAuthNotAllowed('Session not allowed to modify this payment');
    }
    const payment = await db.payment.update({
      where: { id: data.paymentId },
      data: {
        status: data.status,
        transactionHash: data.transactionHash,
      },
    });

    return response({ payment });
  } catch (error: unknown) {
    return handleError(error);
  }
}
