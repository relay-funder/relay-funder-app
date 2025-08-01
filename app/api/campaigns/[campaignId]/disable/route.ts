import { db } from '@/server/db';
import { checkAuth, checkContractAdmin } from '@/lib/api/auth';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { CampaignStatus } from '@/types/campaign';

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }
    // Get campaign info from database
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    // Update campaign status and treasury address in database
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.PENDING_APPROVAL,
      },
    });

    return response({
      campaign: updatedCampaign,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
