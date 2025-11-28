import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import {
  CampaignsWithIdParams,
  PostCampaignWithdrawRouteBodySchema,
} from '@/lib/api/types';
import { getCampaign } from '@/lib/api/campaigns';
import {
  validateWithdrawalAmount,
  normalizeWithdrawalAmount,
} from '@/lib/api/withdrawals/validation';
import { notify } from '@/lib/api/event-feed';
import { getUser } from '@/lib/api/user';

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
        'Only campaign owners may check withdrawal approval.',
      );
    }

    // Check for ANY approved withdrawal (user or admin-initiated)
    // Admin-initiated withdrawals are auto-approved, user-initiated need admin approval
    const approvedWithdrawal = await db.withdrawal.findFirst({
      where: {
        campaignId: campaign.id,
        approvedById: { not: null },
        requestType: 'WITHDRAWAL_AMOUNT',
      },
    });

    const hasApproval = !!approvedWithdrawal;
    const onChainAuthorized = campaign.treasuryWithdrawalsEnabled ?? false;

    return response({ hasApproval, onChainAuthorized });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['user']);
    const { campaignId: campaignIdOrSlug } = await params;
    const {
      amount: rawAmount,
      token,
      transactionHash,
    } = PostCampaignWithdrawRouteBodySchema.parse(await req.json());

    // Normalize amount to prevent precision issues
    const amount = normalizeWithdrawalAmount(rawAmount);

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
        'Only campaign owners may request a withdrawal.',
      );
    }

    // 1. Check on-chain authorization status
    const onChainAuthorized = campaign.treasuryWithdrawalsEnabled ?? false;

    // 2. If transactionHash is provided, user is recording an executed withdrawal
    // This is allowed if they have an approved withdrawal request
    if (transactionHash) {
      if (!onChainAuthorized) {
        throw new ApiAuthNotAllowed(
          'Treasury withdrawals must be authorized on-chain before executing withdrawals.',
        );
      }

      // Check if user has an approved withdrawal request for this amount/token
      // Get the most recent approved request that matches the amount and token
      const approvedWithdrawal = await db.withdrawal.findFirst({
        where: {
          campaignId: campaign.id,
          createdById: user.id,
          amount: amount,
          token: token,
          requestType: 'WITHDRAWAL_AMOUNT',
          approvedById: { not: null }, // Must be approved
          transactionHash: null, // Must not already be executed
        },
        orderBy: {
          createdAt: 'desc', // Get the most recent approved request
        },
      });

      if (!approvedWithdrawal) {
        throw new ApiAuthNotAllowed(
          'You must have an approved withdrawal request before executing. Please create a withdrawal request and wait for admin approval.',
        );
      }

      // Update the existing approved withdrawal with the transaction hash
      const updatedWithdrawal = await db.withdrawal.update({
        where: { id: approvedWithdrawal.id },
        data: { transactionHash },
        include: {
          campaign: true,
        },
      });

      // Track withdrawal execution event
      try {
        const campaignCreator = await getUser(campaign.creatorAddress);
        if (campaignCreator) {
          await notify({
            receiverId: campaignCreator.id,
            creatorId: user.id,
            data: {
              type: 'WithdrawalExecuted',
              withdrawalId: updatedWithdrawal.id,
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              amount: updatedWithdrawal.amount,
              token: updatedWithdrawal.token,
              transactionHash: transactionHash,
            },
          });
        }
      } catch (error) {
        console.error('Failed to create withdrawal execution event', error);
      }

      return response(updatedWithdrawal);
    }

    // 3. No transactionHash - creating a new withdrawal request
    // Users can request withdrawals even if not authorized - they'll be queued
    // But we still validate amount if authorized to prevent invalid requests
    if (onChainAuthorized) {
      await validateWithdrawalAmount(campaign, amount, token);
    }
    // If not authorized, we still create the request but it will be queued
    // Admin will validate when approving

    // 4. Create withdrawal request (pending admin approval)
    const withdrawal = await db.withdrawal.create({
      data: {
        amount,
        token,
        requestType: 'WITHDRAWAL_AMOUNT',
        createdBy: { connect: { id: user.id } },
        campaign: { connect: { id: campaign.id } },
        // No transactionHash - user requests are pending admin approval
      },
    });

    // Track withdrawal request event
    try {
      const campaignCreator = await getUser(campaign.creatorAddress);
      if (campaignCreator) {
        await notify({
          receiverId: campaignCreator.id,
          creatorId: user.id,
          data: {
            type: 'WithdrawalRequested',
            withdrawalId: withdrawal.id,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: withdrawal.amount,
            token: withdrawal.token,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create withdrawal request event', error);
    }

    return response(withdrawal);
  } catch (error: unknown) {
    return handleError(error);
  }
}
// PATCH endpoint moved to admin route - see /api/admin/campaigns/[campaignId]/withdrawals/[withdrawalId]/approve
