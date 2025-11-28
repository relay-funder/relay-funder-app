import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getCampaign } from '@/lib/api/campaigns';
import { notify, notifyIntern } from '@/lib/api/event-feed';
import { getUser } from '@/lib/api/user';

interface ExecuteWithdrawalParams {
  params: Promise<{
    campaignId: string;
    withdrawalId: string;
  }>;
}

/**
 * Admin endpoint to execute a withdrawal on-chain
 * POST /api/admin/campaigns/[campaignId]/withdrawals/[withdrawalId]/execute
 *
 * This endpoint records the transaction hash after the admin has executed
 * the withdrawal on-chain. The actual on-chain execution happens client-side.
 */
export async function POST(req: Request, { params }: ExecuteWithdrawalParams) {
  try {
    const session = await checkAuth(['admin']);
    const { campaignId: campaignIdOrSlug, withdrawalId } = await params;
    const { transactionHash } = await req.json();

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    if (!withdrawalId) {
      throw new ApiParameterError('Withdrawal ID is required');
    }

    if (!transactionHash || typeof transactionHash !== 'string') {
      throw new ApiParameterError('Transaction hash is required');
    }

    const campaign = await getCampaign(campaignIdOrSlug);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    if (!campaign.treasuryWithdrawalsEnabled) {
      throw new ApiAuthNotAllowed(
        'Treasury withdrawals must be enabled on-chain before executing withdrawals.',
      );
    }

    const adminUser = await db.user.findUnique({
      where: { address: session.user.address },
    });
    if (!adminUser) {
      throw new ApiNotFoundError('Admin user not found');
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id: Number(withdrawalId) },
    });

    if (!withdrawal) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    if (withdrawal.campaignId !== campaign.id) {
      throw new ApiParameterError(
        'Withdrawal does not belong to this campaign',
      );
    }

    if (withdrawal.requestType !== 'WITHDRAWAL_AMOUNT') {
      throw new ApiParameterError(
        'Only WITHDRAWAL_AMOUNT requests can be executed',
      );
    }

    if (!withdrawal.approvedById) {
      throw new ApiAuthNotAllowed(
        'Withdrawal must be approved before execution',
      );
    }

    // Update withdrawal with transaction hash
    const updated = await db.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        transactionHash,
      },
      include: {
        campaign: true,
      },
    });

    // Track withdrawal execution event
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
            type: 'WithdrawalExecuted',
            withdrawalId: updated.id,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: updated.amount,
            token: updated.token,
            transactionHash: transactionHash,
            adminName,
          },
        });
      }
      // Also notify admin for audit trail
      await notifyIntern({
        creatorId: adminUser.id,
        data: {
          type: 'WithdrawalExecuted',
          withdrawalId: updated.id,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          amount: updated.amount,
          token: updated.token,
          transactionHash: transactionHash,
          adminName,
        },
      });
    } catch (error) {
      console.error('Failed to create withdrawal execution event', error);
    }

    return response({ withdrawal: updated });
  } catch (error: unknown) {
    return handleError(error);
  }
}
