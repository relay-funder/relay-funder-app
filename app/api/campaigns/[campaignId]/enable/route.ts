import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { CampaignStatus } from '@/types/campaign';
import { getUser } from '@/lib/api/user';
import { notify } from '@/lib/api/event-feed';

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    // Allow both admins and campaign owners to enable campaigns
    const session = await checkAuth(['admin', 'user']);

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

    // Check if user is admin or campaign owner
    const isAdmin = session.user.roles.includes('admin');
    const isOwner = campaign.creatorAddress === session.user.address;

    if (!isAdmin && !isOwner) {
      throw new ApiNotFoundError('Not authorized to enable this campaign');
    }

    // Only allow enabling campaigns that are disabled or pending approval
    if (
      campaign.status !== CampaignStatus.DISABLED &&
      campaign.status !== CampaignStatus.PENDING_APPROVAL
    ) {
      throw new ApiParameterError('Campaign must be disabled to be enabled');
    }

    const user = await getUser(session.user.address);
    if (!user) {
      throw new ApiNotFoundError('User not found');
    }

    const creator = await getUser(campaign.creatorAddress);
    if (!creator) {
      throw new ApiNotFoundError('Campaign Creator not found');
    }

    // Update campaign status to ACTIVE
    const updatedCampaign = await db.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.ACTIVE,
      },
    });

    // Notify the campaign creator
    await notify({
      receiverId: creator.id,
      creatorId: user.id,
      data: {
        type: 'CampaignDisable', // Reusing the same type for consistency
        campaignId,
        campaignTitle: campaign.title,
      },
    });

    return response({
      campaign: updatedCampaign,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
