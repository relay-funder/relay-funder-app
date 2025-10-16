import { db } from '@/server/db';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { RoundsWithIdParams } from '@/lib/api/types';
import { checkAuth } from '@/lib/api/auth';

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
