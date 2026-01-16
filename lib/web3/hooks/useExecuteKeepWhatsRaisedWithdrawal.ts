import { useCallback, useState } from 'react';
import { useWriteContract, ethers } from '@/lib/web3';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { USD_CONFIG } from '@/lib/constant/treasury';

export interface ExecuteKeepWhatsRaisedWithdrawalParams {
  treasuryAddress: string;
  amount: string; // in USD, e.g. "100.00"
}

export interface ExecuteKeepWhatsRaisedWithdrawalResult {
  hash?: string;
  success: boolean;
  error?: string;
}

/**
 * React hook to execute a withdrawal from a KeepWhatsRaised treasury.
 * Calls the treasury's withdraw(uint256 amount) function.
 *
 * IMPORTANT: Funds always go to the campaign owner (INFO.owner()), not the caller.
 * This is enforced by the smart contract.
 */
export function useExecuteKeepWhatsRaisedWithdrawal() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();

  const executeWithdrawal = useCallback(
    async ({
      treasuryAddress,
      amount,
    }: ExecuteKeepWhatsRaisedWithdrawalParams): Promise<ExecuteKeepWhatsRaisedWithdrawalResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!ethers.isAddress(treasuryAddress)) {
        const err = 'Invalid treasury address';
        setError(err);
        return { success: false, error: err };
      }

      try {
        setIsExecuting(true);

        // Parse amount to wei (assuming USD decimals)
        const amountWei = ethers.parseUnits(amount, USD_CONFIG.DECIMALS);

        // Call the KeepWhatsRaised withdraw function
        // Note: Funds always go to INFO.owner() (campaign owner), not the caller
        const tx = await writeContract({
          address: treasuryAddress as `0x${string}`,
          abi: KeepWhatsRaisedABI,
          functionName: 'withdraw',
          args: [amountWei],
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

  return { executeWithdrawal, isExecuting, error, lastTxHash };
}
