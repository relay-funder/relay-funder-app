// ABOUTME: Pre-validation endpoint for withdrawal execution
// ABOUTME: Called before on-chain transactions to prevent executing invalid withdrawals

import { db } from '@/server/db';
import { checkAuth } from '@/lib/api/auth';
import {
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getCampaign } from '@/lib/api/campaigns';
import { validateWithdrawalAmount } from '@/lib/api/withdrawals/validation';

interface ValidateWithdrawalParams {
  params: Promise<{
    campaignId: string;
    withdrawalId: string;
  }>;
}

/**
 * Pre-validate a withdrawal before on-chain execution
 * POST /api/admin/campaigns/[campaignId]/withdrawals/[withdrawalId]/validate
 *
 * This endpoint MUST be called before executing any on-chain withdrawal transaction.
 * It validates:
 * - Campaign exists and has treasury enabled (for WITHDRAWAL_AMOUNT)
 * - Withdrawal exists and belongs to the campaign
 * - Treasury has sufficient balance for the withdrawal amount
 *
 * Returns 200 if validation passes, error otherwise.
 */
export async function POST(req: Request, { params }: ValidateWithdrawalParams) {
  try {
    await checkAuth(['admin']);
    const { campaignId: campaignIdOrSlug, withdrawalId } = await params;

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

    const withdrawal = await db.withdrawal.findUnique({
      where: { id: Number(withdrawalId) },
      include: {
        createdBy: true,
      },
    });

    if (!withdrawal) {
      throw new ApiNotFoundError('Withdrawal not found');
    }

    if (withdrawal.campaignId !== campaign.id) {
      throw new ApiParameterError(
        'Withdrawal does not belong to this campaign',
      );
    }

    // For ON_CHAIN_AUTHORIZATION requests, only check if already authorized
    if (withdrawal.requestType === 'ON_CHAIN_AUTHORIZATION') {
      if (campaign.treasuryWithdrawalsEnabled) {
        throw new ApiAuthNotAllowed(
          'Treasury withdrawals are already enabled for this campaign',
        );
      }
      // Authorization requests don't need balance validation
      return response({ valid: true, requestType: withdrawal.requestType });
    }

    // For WITHDRAWAL_AMOUNT requests:
    // 1. Check treasury is enabled
    if (!campaign.treasuryWithdrawalsEnabled) {
      throw new ApiAuthNotAllowed(
        'Treasury withdrawals must be enabled on-chain before executing withdrawals.',
      );
    }

    // 2. Approval status check removed - this is an admin-only endpoint
    // The admin is validating in order to approve, so requiring prior approval
    // creates a chicken-and-egg problem. Admin is responsible for reviewing
    // the withdrawal request before approving.

    // 3. Check already executed
    if (withdrawal.transactionHash) {
      throw new ApiAuthNotAllowed(
        'Withdrawal has already been executed',
      );
    }

    // 4. Validate withdrawal amount against on-chain balance
    // This will throw if balance is insufficient or if there's an RPC error
    // Pass withdrawal.id to exclude it from pending count (avoid double-counting)
    await validateWithdrawalAmount(campaign, withdrawal.amount, withdrawal.token, withdrawal.id);

    return response({
      valid: true,
      requestType: withdrawal.requestType,
      amount: withdrawal.amount,
      token: withdrawal.token,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
