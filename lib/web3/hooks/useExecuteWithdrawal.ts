import { useCallback, useState } from 'react';
import { useWriteContract, ethers } from '@/lib/web3';
import { PaymentTreasuryABI } from '@/contracts/abi/PaymentTreasury';
import { USDC_CONFIG } from '@/lib/constant/treasury';

export interface ExecuteWithdrawalParams {
  treasuryAddress: string;
  amount: string; // in USD, e.g. "100.00"
}

export interface ExecuteWithdrawalResult {
  hash?: string;
  success: boolean;
  error?: string;
}

/**
 * React hook to execute a withdrawal from the campaign treasury.
 * Calls the treasury's withdraw function and returns the transaction hash.
 */
export function useExecuteWithdrawal() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);
  const { writeContractAsync: writeContract } = useWriteContract();

  const executeWithdrawal = useCallback(
    async ({
      treasuryAddress,
      amount,
    }: ExecuteWithdrawalParams): Promise<ExecuteWithdrawalResult> => {
      setError(null);
      setLastTxHash(undefined);

      if (!ethers.isAddress(treasuryAddress)) {
        const err = 'Invalid treasury address';
        setError(err);
        return { success: false, error: err };
      }

      try {
        setIsExecuting(true);

        // Parse amount to wei (assuming USDC decimals)
        const amountWei = ethers.parseUnits(amount, USDC_CONFIG.DECIMALS);

        // Call the treasury withdraw function
        const tx = await writeContract({
          address: treasuryAddress as `0x${string}`,
          abi: PaymentTreasuryABI,
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
