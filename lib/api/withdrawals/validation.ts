import { db } from '@/server/db';
import { createTreasuryManager } from '@/lib/treasury/interface';
import {
  ApiIntegrityError,
  ApiAuthNotAllowed,
  ApiNotFoundError,
} from '@/lib/api/error';
import type { DbCampaign } from '@/types/campaign';

/**
 * Validate withdrawal amount against on-chain treasury balance and existing withdrawals
 * This ensures no money is withdrawn without proper checks
 */
export async function validateWithdrawalAmount(
  campaign: DbCampaign,
  amount: string,
  token: string,
): Promise<void> {
  if (!campaign.treasuryAddress) {
    throw new ApiNotFoundError('Campaign must have a treasury address');
  }

  // 1. Get on-chain treasury balance (source of truth)
  const treasuryManager = await createTreasuryManager();
  const onChainBalance = await treasuryManager.getBalance(
    campaign.treasuryAddress,
  );
  const availableOnChain = parseFloat(onChainBalance.available || '0');

  if (availableOnChain <= 0) {
    throw new ApiIntegrityError(
      'Treasury has no available balance for withdrawal',
    );
  }

  // 2. Count ALL existing withdrawal requests (both user and admin-initiated)
  // because funds always go to campaign owner
  const existingWithdrawals = await db.withdrawal.findMany({
    where: {
      campaignId: campaign.id,
      requestType: 'WITHDRAWAL_AMOUNT',
    },
  });

  const totalRequestedAmount = existingWithdrawals.reduce((sum, w) => {
    if (w.token === token) {
      return sum + parseFloat(w.amount || '0');
    }
    return sum;
  }, 0);

  const requestedAmount = parseFloat(amount);
  const totalAfterRequest = totalRequestedAmount + requestedAmount;

  // 3. Validate against on-chain available balance (most important check)
  if (totalAfterRequest > availableOnChain) {
    throw new ApiIntegrityError(
      `Withdrawal amount (${amount} ${token}) exceeds available treasury balance (${onChainBalance.available} ${onChainBalance.currency}). ` +
        `Total requested: ${totalRequestedAmount.toFixed(2)} ${token}, Available: ${availableOnChain.toFixed(2)} ${onChainBalance.currency}`,
    );
  }

  // 4. Also validate against confirmed payments (database check)
  // This is a secondary validation to catch any discrepancies
  const confirmedPayments =
    campaign.paymentSummary?.token && token in campaign.paymentSummary?.token
      ? campaign.paymentSummary.token[token].confirmed
      : 0;

  if (totalAfterRequest > confirmedPayments) {
    throw new ApiIntegrityError(
      `Withdrawal amount exceeds confirmed payments. ` +
        `Requested: ${totalAfterRequest.toFixed(2)} ${token}, Confirmed: ${confirmedPayments.toFixed(2)} ${token}`,
    );
  }
}

/**
 * Validate that user-initiated withdrawals require admin approval before execution
 * Users cannot execute withdrawals directly - they must wait for admin approval
 * This function is kept for potential future use but currently users are blocked
 * from providing transactionHash in the POST endpoint
 */
export function validateUserWithdrawalApproval(
  transactionHash: string | undefined,
  hasAdminApproval: boolean,
): void {
  // If user provides transactionHash, they're trying to execute withdrawal
  // This requires admin approval first
  if (transactionHash && !hasAdminApproval) {
    throw new ApiAuthNotAllowed(
      'Cannot execute withdrawal without admin approval. Please request withdrawal and wait for admin approval before executing.',
    );
  }
}

/**
 * Check if campaign has on-chain withdrawal authorization
 */
export function validateOnChainAuthorization(
  treasuryWithdrawalsEnabled: boolean | null | undefined,
): void {
  if (!treasuryWithdrawalsEnabled) {
    throw new ApiAuthNotAllowed(
      'Treasury withdrawals must be enabled on-chain before creating withdrawal requests. Please contact an admin.',
    );
  }
}
