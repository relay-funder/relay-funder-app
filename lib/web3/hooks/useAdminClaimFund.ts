import {
  useTreasuryAction,
  TreasuryActionParams,
  TreasuryActionResult,
} from './useTreasuryAction';

export type ClaimFundParams = TreasuryActionParams;
export type ClaimFundResult = TreasuryActionResult;

export function useAdminClaimFund() {
  const { execute, isExecuting, error, lastTxHash } =
    useTreasuryAction('claimFund');

  return {
    claimFund: execute,
    isClaiming: isExecuting,
    error,
    lastTxHash,
  };
}
