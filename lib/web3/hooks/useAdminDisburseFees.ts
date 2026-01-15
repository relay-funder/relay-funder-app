import { useCallback, useState } from 'react';
import { useWriteContract, ethers } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';

export interface DisburseFeesParams {
  treasuryAddress: string;
}

export interface DisburseFeesResult {
  hash?: string;
  success: boolean;
  error?: string;
}

/**
 * React hook to disburse accumulated platform and protocol fees from the treasury.
 * Calls the treasury's disburseFees function to distribute fees to
 * protocol and platform administrators.
 */
export function useAdminDisburseFees() {
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();

  const disburseFees = useCallback(
    async ({ treasuryAddress }: DisburseFeesParams): Promise<DisburseFeesResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!ethers.isAddress(treasuryAddress)) {
        const err = 'Invalid treasury address';
        setError(err);
        return { success: false, error: err };
      }

      try {
        setIsDisbursing(true);

        const tx = await writeContract({
          address: treasuryAddress as `0x${string}`,
          abi: KeepWhatsRaisedABI,
          functionName: 'disburseFees',
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
        setIsDisbursing(false);
      }
    },
    [writeContract],
  );

  return { disburseFees, isDisbursing, error, lastTxHash };
}
