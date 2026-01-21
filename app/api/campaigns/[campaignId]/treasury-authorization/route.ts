import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
  ApiIntegrityError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';

/**
 * User endpoint to request treasury authorization
 * POST /api/campaigns/[campaignId]/treasury-authorization
 *
 * Creates an ON_CHAIN_AUTHORIZATION request that admin must approve and execute.
 * Users cannot execute on-chain authorization themselves - only admins can.
 */
export async function POST(req: Request, { params }: CampaignsWithIdParams) {
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
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (campaign.creatorAddress.toLowerCase() !== user.address.toLowerCase()) {
      throw new ApiAuthNotAllowed(
        'Only campaign owners may request treasury authorization.',
      );
    }

    if (!campaign.treasuryAddress) {
      throw new ApiParameterError('Campaign does not have a treasury address');
    }

    // Check if already authorized
    if (campaign.treasuryWithdrawalsEnabled) {
      throw new ApiIntegrityError(
        'Treasury withdrawals are already enabled for this campaign',
      );
    }

    // Check if there's already a pending authorization request
    const existingAuthRequest = await db.withdrawal.findFirst({
      where: {
        campaignId: campaign.id,
        requestType: 'ON_CHAIN_AUTHORIZATION',
        approvedById: null, // Not yet approved
      },
    });

    if (existingAuthRequest) {
      throw new ApiIntegrityError(
        'A treasury authorization request is already pending. Please wait for admin approval.',
      );
    }

    // Create withdrawal request of type ON_CHAIN_AUTHORIZATION (pending admin approval)
    const withdrawal = await db.withdrawal.create({
      data: {
        amount: '0', // No amount for authorization request
        token: 'N/A', // No token for authorization request
        requestType: 'ON_CHAIN_AUTHORIZATION',
        notes: 'User requested treasury authorization',
        createdBy: { connect: { id: user.id } },
        campaign: { connect: { id: campaign.id } },
        // No transactionHash - admin will execute on-chain and set this
        // No approvedBy - admin must approve this request
      },
      include: {
        campaign: true,
        createdBy: true,
      },
    });

    return response({ withdrawal });
  } catch (error: unknown) {
    return handleError(error);
  }
}
