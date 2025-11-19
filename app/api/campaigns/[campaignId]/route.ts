import { getCampaign } from '@/lib/api/campaigns';
import { db } from '@/server/db';
import { checkAuth, isAdmin } from '@/lib/api/auth';
import {
  ApiParameterError,
  ApiNotFoundError,
  ApiIntegrityError,
  ApiAuthNotAllowed,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams, GetCampaignResponse } from '@/lib/api/types';

export async function GET(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const admin = await isAdmin();

    const { campaignId: campaignIdOrSlug } = await params;
    const instance = await getCampaign(campaignIdOrSlug);
    if (!instance) {
      throw new ApiNotFoundError('Campaign not found');
    }

    // Check access control for non-active campaigns
    if (instance.status !== 'ACTIVE') {
      // Only campaign owners and admins can access non-active campaigns
      if (instance.creatorAddress !== session.user.address && !admin) {
        throw new ApiNotFoundError('Campaign not found');
      }
    }

    return response({
      campaign: instance,
    } as GetCampaignResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
export async function DELETE(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }
    if (campaign.status === 'ACTIVE') {
      throw new ApiIntegrityError('cannot delete a active campaign');
    }
    if (campaign.creatorAddress !== session.user.address) {
      await checkAuth(['admin']);
    }

    await db.campaign.delete({ where: { id: campaignId } });
    return response({
      ok: true,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
