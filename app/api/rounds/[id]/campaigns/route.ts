import { db } from '@/server/db';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import { debugApi as debug } from '@/lib/debug';

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
    if (new Date() > new Date(round.endDate)) {
      throw new ApiParameterError('Cannot apply campaign to ended round');
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
    if (new Date() > new Date(round.endDate)) {
      throw new ApiParameterError('Cannot delete campaign from ended round');
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

    // Log the removal action for tracking
    debug &&
      console.log(
        `Campaign removal: Campaign ${campaignId} removed from Round ${roundId}`,
        {
          campaignId,
          roundId,
          campaignTitle: campaign.title,
          roundTitle: round.title,
          removedBy: admin ? 'admin' : 'user',
          removerAddress: session.user.address,
          previousStatus: roundCampaign.status,
          timestamp: new Date().toISOString(),
        },
      );

    await db.roundCampaigns.delete({ where: { id: roundCampaign.id } });

    return response({
      ok: true,
      removedBy: admin ? 'admin' : 'user',
      campaignTitle: campaign.title,
      roundTitle: round.title,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
