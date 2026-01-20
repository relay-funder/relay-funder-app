import { useTreasuryAction, TreasuryActionParams, TreasuryActionResult } from './useTreasuryAction';

export type ClaimTipParams = TreasuryActionParams;
export type ClaimTipResult = TreasuryActionResult;

export function useAdminClaimTip() {
  const { execute, isExecuting, error, lastTxHash } = useTreasuryAction('claimTip');

  return {
    claimTip: execute,
    isClaiming: isExecuting,
    error,
    lastTxHash,
  };
}
