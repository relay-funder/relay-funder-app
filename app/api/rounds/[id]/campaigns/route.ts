import { db } from '@/server/db';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';
import { checkAuth, isAdmin } from '@/lib/api/auth';

export async function POST(req: Request, { params }: RoundsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const admin = await isAdmin();
    const roundId = parseInt((await params).id);
    if (!roundId) {
      throw new ApiParameterError('roundId is required');
    }
    const round = await db.round.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }
    const creatorAddress = session.user.address;
    const formData = await req.formData();
    // Extract form fields
    const campaignId = parseInt(formData.get('campaignId') as string);
    const status = formData.get('status') as
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED'
      | undefined;
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    if (!admin) {
      if (campaign.creatorAddress !== session.user.address) {
        throw new ApiParameterError('Cannot apply for not owned campaign');
      }
      if (status) {
        throw new ApiParameterError('Cannot set status');
      }
    }
    const roundCampaign = {
      campaignId,
      submittedByWalletAddress: creatorAddress,
      status: status ?? 'PENDING',
      approvedAt: null as Date | null,
    };
    if (status === 'APPROVED') {
      roundCampaign.approvedAt = new Date();
    }
    await db.round.update({
      where: { id: roundId },
      data: {
        roundCampaigns: {
          create: roundCampaign,
        },
      },
    });
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: RoundsWithIdParams) {
  try {
    await checkAuth(['admin']);
    const roundId = parseInt((await params).id);
    if (!roundId) {
      throw new ApiParameterError('roundId is required');
    }
    const round = await db.round.findUnique({
      where: { id: roundId },
      include: { roundCampaigns: true },
    });

    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }
    const formData = await req.formData();
    // Extract form fields
    const campaignId = parseInt(formData.get('campaignId') as string);
    const status = formData.get('status') as
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED';
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      throw new ApiParameterError(`Invalid status ${status}`);
    }
    const roundCampaign = round.roundCampaigns.find(
      (roundCampaign) => roundCampaign.campaignId === campaignId,
    );
    if (!roundCampaign) {
      throw new ApiNotFoundError('Campaign not part of round');
    }
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    const data = { status, approvedAt: roundCampaign.approvedAt };
    if (status === 'APPROVED') {
      data.approvedAt = new Date();
    }
    await db.roundCampaigns.update({
      where: { id: roundCampaign.id },
      data,
    });
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function DELETE(req: Request, { params }: RoundsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const admin = await isAdmin();
    const roundId = parseInt((await params).id);
    if (!roundId) {
      throw new ApiParameterError('roundId is required');
    }
    const round = await db.round.findUnique({
      where: { id: roundId },
      include: { roundCampaigns: true },
    });

    if (!round) {
      throw new ApiNotFoundError('Round not found');
    }
    const formData = await req.formData();
    // Extract form fields
    const campaignId = parseInt(formData.get('campaignId') as string);
    const roundCampaign = round.roundCampaigns.find(
      (roundCampaign) => roundCampaign.campaignId === campaignId,
    );
    if (!roundCampaign) {
      throw new ApiNotFoundError('Campaign not part of round');
    }
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    if (!admin) {
      if (campaign.creatorAddress !== session.user.address) {
        throw new ApiParameterError('Cannot remove for not owned campaign');
      }
      if (roundCampaign.status === 'APPROVED') {
        throw new ApiParameterError(
          'Cannot remove campaign that is approved for round',
        );
      }
    }

    await db.roundCampaigns.delete({ where: { id: roundCampaign.id } });
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
