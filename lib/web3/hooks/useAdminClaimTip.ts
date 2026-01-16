import { useCallback, useState } from 'react';
import { isAddress } from 'viem';
import { useWriteContract } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';

export interface ClaimTipParams {
  treasuryAddress: string;
}

export interface ClaimTipResult {
  hash?: string;
  success: boolean;
  error?: string;
}

/**
 * React hook to claim accumulated tips from the treasury.
 * Calls the treasury's claimTip function.
 * Note: Only available after campaign deadline or cancellation.
 */
export function useAdminClaimTip() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();

  const claimTip = useCallback(
    async ({ treasuryAddress }: ClaimTipParams): Promise<ClaimTipResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!isAddress(treasuryAddress)) {
        const err = 'Invalid treasury address';
        setError(err);
        return { success: false, error: err };
      }

      try {
        setIsClaiming(true);

        const tx = await writeContract({
          address: treasuryAddress as `0x${string}`,
          abi: KeepWhatsRaisedABI,
          functionName: 'claimTip',
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
        setIsClaiming(false);
      }
    },
    [writeContract],
  );

  return { claimTip, isClaiming, error, lastTxHash };
}
