import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiIntegrityError,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getCampaign } from '@/lib/api/campaigns';
import { validateWithdrawalAmount } from '@/lib/api/withdrawals/validation';
import { notify, notifyIntern } from '@/lib/api/event-feed';
import { getUser } from '@/lib/api/user';
import { z } from 'zod';

const PatchAdminWithdrawalApprovalSchema = z.object({
  transactionHash: z.string().optional(),
  notes: z.string().optional().or(z.null()),
});

interface ApproveWithdrawalParams {
  params: Promise<{
    campaignId: string;
    withdrawalId: string;
  }>;
}

/**
 * Admin endpoint to approve user-initiated withdrawal requests
 * PATCH /api/admin/campaigns/[campaignId]/withdrawals/[withdrawalId]/approve
 *
 * This endpoint is ONLY for approving USER-initiated withdrawals.
 * Admin-initiated withdrawals are auto-approved when created.
 */
export async function PATCH(req: Request, { params }: ApproveWithdrawalParams) {
  try {
    const session = await checkAuth(['admin']);
    const { campaignId: campaignIdOrSlug, withdrawalId } = await params;
    const { transactionHash, notes } = PatchAdminWithdrawalApprovalSchema.parse(
      await req.json(),
    );

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    if (!withdrawalId) {
      throw new ApiParameterError('Withdrawal ID is required');
    }

    const campaign = await getCampaign(campaignIdOrSlug);
    if (!campaign) {
      throw new ApiNotFoundError('Campaign not found');
    }

    const adminUser = await db.user.findUnique({
      where: { address: session.user.address },
    });
    if (!adminUser) {
      throw new ApiNotFoundError('Admin user not found');
    }

    const instance = await db.withdrawal.findUnique({
      where: { id: Number(withdrawalId) },
      include: {
        createdBy: true,
      },
    });

    if (!instance) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    if (instance.campaignId !== campaign.id) {
      throw new ApiParameterError(
        'Withdrawal does not belong to this campaign',
      );
    }

    // Ensure this is a USER-initiated withdrawal (not admin-initiated)
    if (instance.createdBy.roles.includes('admin')) {
      throw new ApiAuthNotAllowed(
        'Cannot approve admin-initiated withdrawals. Admin withdrawals are auto-approved when created.',
      );
    }

    // Handle ON_CHAIN_AUTHORIZATION requests differently
    if (instance.requestType === 'ON_CHAIN_AUTHORIZATION') {
      // Check if already authorized
      if (campaign.treasuryWithdrawalsEnabled) {
        throw new ApiIntegrityError(
          'Treasury withdrawals are already enabled for this campaign',
        );
      }

      // Transaction hash is optional - if provided, it means admin executed on-chain
      // If not provided, admin will execute on-chain and provide hash later
      // For now, we allow approval without hash (admin executes client-side)

      // Update withdrawal with approval and transaction hash (if provided)
      const withdrawal = await db.withdrawal.update({
        where: { id: instance.id },
        data: {
          ...(transactionHash && { transactionHash }),
          notes: notes ?? null,
          approvedBy: { connect: { id: adminUser.id } },
        },
      });

      // Update campaign with authorization details when transaction hash is provided
      // This means the on-chain authorization was executed successfully
      if (transactionHash) {
        await db.campaign.update({
          where: { id: campaign.id },
          data: {
            treasuryWithdrawalsEnabled: true,
            treasuryApprovalTxHash: transactionHash,
            treasuryApprovalTimestamp: new Date(),
            treasuryApprovalAdmin: { connect: { id: adminUser.id } },
          },
        });

        // Track treasury authorization event (only when transaction hash is provided)
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
                type: 'TreasuryAuthorized',
                withdrawalId: withdrawal.id,
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                transactionHash: transactionHash,
                adminName,
              },
            });
          }
          // Also notify admin for audit trail
          await notifyIntern({
            creatorId: adminUser.id,
            data: {
              type: 'TreasuryAuthorized',
              withdrawalId: withdrawal.id,
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              transactionHash: transactionHash,
              adminName,
            },
          });
        } catch (error) {
          console.error('Failed to create treasury authorization event', error);
        }
      }

      return response({ withdrawal });
    }

    // Handle WITHDRAWAL_AMOUNT requests
    // For WITHDRAWAL_AMOUNT requests, require on-chain authorization
    if (!campaign.treasuryWithdrawalsEnabled) {
      throw new ApiAuthNotAllowed(
        'Cannot approve withdrawal amount request. Treasury withdrawals must be enabled on-chain first.',
      );
    }

    // Validate withdrawal amount against on-chain balance before approving
    // This ensures no money is approved for withdrawal without proper checks
    // Pass instance.id to exclude it from pending count (avoid double-counting)
    await validateWithdrawalAmount(campaign, instance.amount, instance.token, instance.id);

    const withdrawal = await db.withdrawal.update({
      where: { id: instance.id },
      data: {
        ...(transactionHash && { transactionHash }),
        ...(notes !== undefined && { notes }),
        approvedBy: { connect: { id: adminUser.id } },
      },
      include: {
        campaign: true,
        createdBy: true,
        approvedBy: true,
      },
    });

    // Track withdrawal approval event
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
            type: 'WithdrawalApproved',
            withdrawalId: withdrawal.id,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: withdrawal.amount,
            token: withdrawal.token,
            adminName,
            transactionHash: transactionHash,
          },
        });
      }
      // Also notify admin for audit trail
      await notifyIntern({
        creatorId: adminUser.id,
        data: {
          type: 'WithdrawalApproved',
          withdrawalId: withdrawal.id,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          amount: withdrawal.amount,
          token: withdrawal.token,
          adminName,
          transactionHash: transactionHash,
        },
      });
    } catch (error) {
      console.error('Failed to create withdrawal approval event', error);
    }

    return response({ withdrawal });
  } catch (error: unknown) {
    return handleError(error);
  }
}
