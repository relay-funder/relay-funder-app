import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { getCampaign, toggleHideCampaignUpdate } from '@/lib/api/campaigns';
import { getUser } from '@/lib/api/user';

interface UpdateParams extends CampaignsWithIdParams {
  params: Promise<{ campaignId: string; updateId: string }>;
}

export async function PATCH(req: Request, { params }: UpdateParams) {
  try {
    const session = await checkAuth(['user']);
    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }
    const campaignId = parseInt((await params).campaignId, 10);
    const updateId = parseInt((await params).updateId, 10);
    if (!campaignId || !updateId) {
      throw new ApiParameterError('campaignId and updateId are required');
    }
    const campaign = await getCampaign(campaignId);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    if (campaign.creatorAddress !== session.user.address) {
      if (!(await isAdmin())) {
        throw new ApiAuthNotAllowed(
          'Only the campaign creator can hide updates',
        );
      }
    }

    const update = await db.campaignUpdate.findUnique({
      where: { id: updateId, campaignId },
    });
    if (!update) {
      throw new ApiNotFoundError('Update not found');
    }

    const updatedUpdate = await toggleHideCampaignUpdate(
      campaign.id,
      update.id,
    );

    return response({
      ok: true,
      update: updatedUpdate,
    });
  } catch (error) {
    return handleError(error);
  }
}
