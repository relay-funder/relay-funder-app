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
      // For authorization requests, admin must provide transactionHash (on-chain execution)
      if (!transactionHash) {
        throw new ApiParameterError(
          'Transaction hash is required when approving treasury authorization requests. Admin must execute the on-chain authorization first.',
        );
      }

      // Check if already authorized
      if (campaign.treasuryWithdrawalsEnabled) {
        throw new ApiIntegrityError(
          'Treasury withdrawals are already enabled for this campaign',
        );
      }

      // Update withdrawal with approval and transaction hash
      const withdrawal = await db.withdrawal.update({
        where: { id: instance.id },
        data: {
          transactionHash,
          notes: notes ?? null,
          approvedBy: { connect: { id: adminUser.id } },
        },
      });

      // Update campaign with authorization details
      await db.campaign.update({
        where: { id: campaign.id },
        data: {
          treasuryWithdrawalsEnabled: true,
          treasuryApprovalTxHash: transactionHash,
          treasuryApprovalTimestamp: new Date(),
          treasuryApprovalAdmin: { connect: { id: adminUser.id } },
        },
      });

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
    await validateWithdrawalAmount(campaign, instance.amount, instance.token);

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

    return response({ withdrawal });
  } catch (error: unknown) {
    return handleError(error);
  }
}
