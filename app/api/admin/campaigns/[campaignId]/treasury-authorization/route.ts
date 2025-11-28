import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiNotFoundError,
  ApiParameterError,
  ApiIntegrityError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  CampaignsWithIdParams,
  PostTreasuryAuthorizationRouteBodySchema,
} from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    const { campaignId: campaignIdOrSlug } = await params;
    const { transactionHash, notes } =
      PostTreasuryAuthorizationRouteBodySchema.parse(await req.json());

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    const campaign = await getCampaign(campaignIdOrSlug);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (!campaign.treasuryAddress) {
      throw new ApiParameterError('Campaign does not have a treasury address');
    }

    const adminUser = await db.user.findUnique({
      where: {
        address: session.user.address,
      },
    });
    if (!adminUser) {
      throw new ApiNotFoundError('Admin user not found');
    }

    // Check if already authorized
    if (campaign.treasuryWithdrawalsEnabled) {
      throw new ApiIntegrityError(
        'Treasury withdrawals are already enabled for this campaign',
      );
    }

    // Create withdrawal request of type ON_CHAIN_AUTHORIZATION
    const withdrawal = await db.withdrawal.create({
      data: {
        amount: '0', // No amount for authorization request
        token: 'N/A', // No token for authorization request
        requestType: 'ON_CHAIN_AUTHORIZATION',
        notes: notes ?? null,
        transactionHash,
        createdBy: { connect: { id: adminUser.id } },
        approvedBy: { connect: { id: adminUser.id } }, // Auto-approved since admin is executing
        campaign: { connect: { id: campaign.id } },
      },
      include: {
        campaign: true,
        createdBy: true,
        approvedBy: true,
      },
    });

    // Update campaign with authorization details
    const updatedCampaign = await db.campaign.update({
      where: { id: campaign.id },
      data: {
        treasuryWithdrawalsEnabled: true,
        treasuryApprovalTxHash: transactionHash,
        treasuryApprovalTimestamp: new Date(),
        treasuryApprovalAdmin: { connect: { id: adminUser.id } },
      },
      select: {
        id: true,
        treasuryWithdrawalsEnabled: true,
        treasuryApprovalTxHash: true,
        treasuryApprovalTimestamp: true,
      },
    });

    return response({
      campaign: updatedCampaign,
      withdrawal,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
