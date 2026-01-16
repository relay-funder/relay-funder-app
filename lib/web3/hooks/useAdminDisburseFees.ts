import { useTreasuryAction, TreasuryActionParams, TreasuryActionResult } from './useTreasuryAction';

export type DisburseFeesParams = TreasuryActionParams;
export type DisburseFeesResult = TreasuryActionResult;

export function useAdminDisburseFees() {
  const { execute, isExecuting, error, lastTxHash } = useTreasuryAction('disburseFees');

  return {
    disburseFees: execute,
    isDisbursing: isExecuting,
    error,
    lastTxHash,
  };
}
