import { getCampaign } from '@/lib/api/campaigns';
import { ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams, GetCampaignResponse } from '@/lib/api/types';

export async function GET(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const { campaignId: campaignIdOrSlug } = await params;
    const instance = await getCampaign(campaignIdOrSlug);
    if (!instance) {
      throw new ApiNotFoundError('Campaign not found');
    }

    return response({
      campaign: instance,
    } as GetCampaignResponse);
  } catch (error: unknown) {
    return handleError(error);
  }
}
