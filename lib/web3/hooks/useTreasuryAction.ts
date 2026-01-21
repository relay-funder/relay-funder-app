import { useCallback, useState } from 'react';
import { isAddress } from 'viem';
import { useWriteContract } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';

export interface TreasuryActionParams {
  treasuryAddress: string;
}

export interface TreasuryActionResult {
  hash?: string;
  success: boolean;
  error?: string;
}

export type TreasuryActionFunctionName = 'claimTip' | 'disburseFees';

export function useTreasuryAction(functionName: TreasuryActionFunctionName) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();

  const execute = useCallback(
    async ({ treasuryAddress }: TreasuryActionParams): Promise<TreasuryActionResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!isAddress(treasuryAddress)) {
        const err = 'Invalid treasury address';
        setError(err);
        return { success: false, error: err };
      }

      try {
        setIsExecuting(true);

        const tx = await writeContract({
          address: treasuryAddress as `0x${string}`,
          abi: KeepWhatsRaisedABI,
          functionName,
          args: [],
        });

        const hash: string | undefined = tx;
        setLastTxHash(hash);
        return { hash, success: true };
      } catch (e) {
        const err = e instanceof Error ? e.message : 'Unknown error';
        setError(err);
        return { success: false, error: err };
      } finally {
        setIsExecuting(false);
      }
    },
    [writeContract, functionName],
  );

  return { execute, isExecuting, error, lastTxHash };
}
