import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';

/**
 * User-facing endpoint to list ALL withdrawals for their campaign
 * GET /api/campaigns/[campaignId]/withdrawals
 *
 * Returns all withdrawals (both user and admin-initiated) because
 * funds always go to the campaign owner, so they need to see everything.
 */
export async function GET(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const { campaignId: campaignIdOrSlug } = await params;

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
        'Only campaign owners may view withdrawals for their campaign.',
      );
    }

    // Return ALL withdrawals for this campaign (both user and admin-initiated)
    // because funds always go to the campaign owner
    const withdrawals = await db.withdrawal.findMany({
      where: {
        campaignId: campaign.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            address: true,
            username: true,
            firstName: true,
            lastName: true,
            roles: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            address: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return response({ withdrawals });
  } catch (error: unknown) {
    return handleError(error);
  }
}
