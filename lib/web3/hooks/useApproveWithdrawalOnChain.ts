import { useCallback, useState } from 'react';
import { useWriteContract, ethers } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';

export interface ApproveWithdrawalOnChainParams {
  treasuryAddress: string;
}

export interface ApproveWithdrawalOnChainResult {
  hash?: string;
  success: boolean;
  error?: string;
}

/**
 * React hook to approve withdrawals on-chain for a treasury.
 * Calls the treasury's approveWithdrawal() function (one-time admin action).
 * This enables the withdraw() function to be called by campaign owners.
 */
export function useApproveWithdrawalOnChain() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();

  const approveWithdrawal = useCallback(
    async ({
      treasuryAddress,
    }: ApproveWithdrawalOnChainParams): Promise<ApproveWithdrawalOnChainResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!ethers.isAddress(treasuryAddress)) {
        const err = 'Invalid treasury address';
        setError(err);
        return { success: false, error: err };
      }

      try {
        setIsExecuting(true);

        // Call the treasury approveWithdrawal function (no arguments)
        const tx = await writeContract({
          address: treasuryAddress as `0x${string}`,
          abi: KeepWhatsRaisedABI,
          functionName: 'approveWithdrawal',
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
    [writeContract],
  );

  return { approveWithdrawal, isExecuting, error, lastTxHash };
}
