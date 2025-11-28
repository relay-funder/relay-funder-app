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
import {
  validateWithdrawalAmount,
  normalizeWithdrawalAmount,
} from '@/lib/api/withdrawals/validation';
import { notify, notifyIntern } from '@/lib/api/event-feed';
import { getUser } from '@/lib/api/user';
import { z } from 'zod';

const PostAdminWithdrawalRequestSchema = z.object({
  amount: z.string(),
  token: z.string(),
  notes: z.string().optional().or(z.null()),
});

/**
 * Admin endpoint to create withdrawal requests without user request
 * POST /api/admin/campaigns/[campaignId]/withdrawals
 */
export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    const { campaignId: campaignIdOrSlug } = await params;
    const {
      amount: rawAmount,
      token,
      notes,
    } = PostAdminWithdrawalRequestSchema.parse(await req.json());

    // Normalize amount to prevent precision issues
    const amount = normalizeWithdrawalAmount(rawAmount);

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    const campaign = await getCampaign(campaignIdOrSlug);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (!campaign.treasuryAddress) {
      throw new ApiAuthNotAllowed(
        'Campaign must have a treasury address to create withdrawal requests.',
      );
    }

    if (!campaign.treasuryWithdrawalsEnabled) {
      throw new ApiAuthNotAllowed(
        'Treasury withdrawals must be enabled on-chain before creating withdrawal requests.',
      );
    }

    const adminUser = await db.user.findUnique({
      where: { address: session.user.address },
    });
    if (!adminUser) {
      throw new ApiNotFoundError('Admin user not found');
    }

    // Validate withdrawal amount against on-chain balance and existing withdrawals
    // This ensures no money is withdrawn without proper checks
    await validateWithdrawalAmount(campaign, amount, token);

    // Create withdrawal request (admin-initiated, auto-approved)
    const withdrawal = await db.withdrawal.create({
      data: {
        amount,
        token,
        requestType: 'WITHDRAWAL_AMOUNT',
        createdBy: { connect: { id: adminUser.id } },
        approvedBy: { connect: { id: adminUser.id } },
        campaign: { connect: { id: campaign.id } },
        notes: notes ?? null,
      },
    });

    // Track withdrawal request event
    try {
      const campaignCreator = await getUser(campaign.creatorAddress);
      const adminName =
        adminUser.username ||
        adminUser.firstName ||
        adminUser.address.slice(0, 10) + '...';
      if (campaignCreator) {
        await notify({
          receiverId: campaignCreator.id,
          creatorId: adminUser.id,
          data: {
            type: 'WithdrawalRequestedByAdmin',
            withdrawalId: withdrawal.id,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: withdrawal.amount,
            token: withdrawal.token,
            adminName,
          },
        });
      }
      // Also notify admin for audit trail
      await notifyIntern({
        creatorId: adminUser.id,
        data: {
          type: 'WithdrawalRequestedByAdmin',
          withdrawalId: withdrawal.id,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          amount: withdrawal.amount,
          token: withdrawal.token,
          adminName,
        },
      });
    } catch (error) {
      console.error('Failed to create admin withdrawal request event', error);
    }

    return response({ withdrawal });
  } catch (error: unknown) {
    return handleError(error);
  }
}
