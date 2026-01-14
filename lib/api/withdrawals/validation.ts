import { db } from '@/server/db';
import { createTreasuryManager } from '@/lib/treasury/interface';
import {
  ApiIntegrityError,
  ApiAuthNotAllowed,
  ApiNotFoundError,
  ApiParameterError,
} from '@/lib/api/error';
import type { DbCampaign } from '@/types/campaign';

/**
 * Normalize withdrawal amount to prevent precision issues
 * - Rejects scientific notation (e.g., 1e-5)
 * - Validates it's a valid positive number
 * - Normalizes to fixed decimal format (max 6 decimal places)
 * - Returns normalized string for consistent database storage
 */
export function normalizeWithdrawalAmount(amount: string): string {
  // Reject empty or whitespace-only strings
  if (!amount || typeof amount !== 'string' || amount.trim().length === 0) {
    throw new ApiParameterError('Amount is required');
  }

  // Reject scientific notation (e.g., 1e-5, 1E-5, 1e+5)
  if (/[eE]/.test(amount)) {
    throw new ApiParameterError(
      'Amount cannot use scientific notation. Please use decimal format (e.g., 0.00001 instead of 1e-5)',
    );
  }

  // Parse as number
  const num = parseFloat(amount.trim());

  // Validate it's a valid number
  if (!Number.isFinite(num)) {
    throw new ApiParameterError('Amount must be a valid number');
  }

  // Validate it's positive
  if (num <= 0) {
    throw new ApiParameterError('Amount must be greater than 0');
  }

  // Normalize to fixed decimal format (max 6 decimal places)
  // This prevents precision issues when comparing amounts in database queries
  const normalized = num.toFixed(6);

  // Remove trailing zeros to keep format clean (e.g., "100.000000" -> "100")
  // But preserve at least one decimal place if original had decimals
  const hasDecimal = amount.includes('.');
  const normalizedNum = parseFloat(normalized);
  const result = hasDecimal
    ? normalizedNum.toString()
    : normalizedNum.toFixed(0);

  return result;
}

/**
 * Validate withdrawal amount against on-chain treasury balance and existing withdrawals
 * This ensures no money is withdrawn without proper checks
 *
 * @param excludeWithdrawalId - Optional withdrawal ID to exclude from pending count
 *   (used when validating an existing withdrawal to avoid double-counting)
 */
export async function validateWithdrawalAmount(
  campaign: DbCampaign,
  amount: string,
  token: string,
  excludeWithdrawalId?: number,
): Promise<void> {
  if (!campaign.treasuryAddress) {
    throw new ApiNotFoundError('Campaign must have a treasury address');
  }

  // Normalize amount to prevent precision issues
  const normalizedAmount = normalizeWithdrawalAmount(amount);

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

  // 2. Count PENDING withdrawal requests (not yet executed)
  // Executed withdrawals have already reduced the on-chain balance, so we only
  // count pending ones to avoid double-counting
  const existingWithdrawals = await db.withdrawal.findMany({
    where: {
      campaignId: campaign.id,
      requestType: 'WITHDRAWAL_AMOUNT',
      transactionHash: null, // Only pending (not executed) withdrawals
      // Exclude the current withdrawal if provided (to avoid double-counting when validating existing)
      ...(excludeWithdrawalId && { id: { not: excludeWithdrawalId } }),
    },
  });

  const totalRequestedAmount = existingWithdrawals.reduce((sum, w) => {
    if (w.token === token) {
      return sum + parseFloat(w.amount || '0');
    }
    return sum;
  }, 0);

  const requestedAmount = parseFloat(normalizedAmount);
  const totalAfterRequest = totalRequestedAmount + requestedAmount;

  // 3. Validate against on-chain available balance (most important check)
  // Round to cents (2 decimal places) to avoid floating point precision issues
  // (e.g., 1.99 vs 1.9899 from on-chain balance calculations)
  const roundedTotal = Math.round(totalAfterRequest * 100) / 100;
  const roundedAvailable = Math.round(availableOnChain * 100) / 100;
  if (roundedTotal > roundedAvailable) {
    throw new ApiIntegrityError(
      `Withdrawal amount (${normalizedAmount} ${token}) exceeds available treasury balance (${onChainBalance.available} ${onChainBalance.currency}). ` +
        `Total requested: ${totalRequestedAmount.toFixed(2)} ${token}, Available: ${availableOnChain.toFixed(2)} ${onChainBalance.currency}`,
    );
  }

  // 4. Also validate against confirmed payments (database check)
  // This is a secondary validation to catch any discrepancies
  const confirmedPayments =
    campaign.paymentSummary?.token && token in campaign.paymentSummary?.token
      ? campaign.paymentSummary.token[token].confirmed
      : 0;

  // Round to cents to avoid floating point precision issues
  const roundedConfirmed = Math.round(confirmedPayments * 100) / 100;
  if (roundedTotal > roundedConfirmed) {
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
