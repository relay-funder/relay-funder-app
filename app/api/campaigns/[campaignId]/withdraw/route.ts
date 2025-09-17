import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiIntegrityError,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  CampaignsWithIdParams,
  PatchCampaignWithdrawRouteBodySchema,
  PostCampaignWithdrawRouteBodySchema,
} from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const { campaignId: campaignIdOrSlug } = await params;
    const { amount, token } = PostCampaignWithdrawRouteBodySchema.parse(
      await req.json(),
    );

    const user = await db.user.findUnique({
      where: {
        address: session.user.address,
      },
    });
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    const campaign = await getCampaign(campaignIdOrSlug);

    if (campaign?.creatorAddress != user.address) {
      throw new ApiAuthNotAllowed(
        'Only campaign owners may request a withdrawal.',
      );
    }

    const withdrawals = await db.withdrawal.findMany({
      where: { campaignId: campaign.id },
    });
    const withdrawalsMap: Record<string, number> = {};
    for (const withdrawal of withdrawals) {
      if (typeof withdrawalsMap[withdrawal.token] !== 'number') {
        withdrawalsMap[withdrawal.token] = Number(withdrawal.amount);
      } else {
        withdrawalsMap[withdrawal.token] += Number(withdrawal.amount);
      }
    }
    const confirmedPayments =
      campaign.paymentSummary?.token && token in campaign.paymentSummary?.token
        ? campaign.paymentSummary.token[token].confirmed
        : 0;
    if (typeof withdrawalsMap[token] === 'number') {
      if (Number(amount) + withdrawalsMap[token] > confirmedPayments) {
        throw new ApiIntegrityError(
          'Amount exceeds approved payments (with requested withdrawals)',
        );
      }
    } else {
      if (Number(amount) > confirmedPayments) {
        throw new ApiIntegrityError('Amount exceeds approved payments');
      }
    }
    const withdrawal = await db.withdrawal.create({
      data: {
        amount,
        token,
        createdBy: { connect: { id: user.id } },
        campaign: { connect: { id: campaign.id } },
      },
    });
    return response(withdrawal);
  } catch (error: unknown) {
    return handleError(error);
  }
}
export async function PATCH(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    const { campaignId: campaignIdOrSlug } = await params;
    const { withdrawalId, transactionHash, notes } =
      PatchCampaignWithdrawRouteBodySchema.parse(await req.json());

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    const campaign = await getCampaign(campaignIdOrSlug);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    const adminUser = await db.user.findUnique({
      where: {
        address: session.user.address,
      },
    });
    if (!adminUser) {
      throw new ApiNotFoundError('User not found');
    }

    const instance = await db.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    if (!instance) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    const withdrawal = await db.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        transactionHash,
        notes: notes ?? null,
        approvedBy: { connect: { id: adminUser.id } },
      },
    });
    return response(withdrawal);
  } catch (error: unknown) {
    return handleError(error);
  }
}
