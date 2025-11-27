import { useReadContract } from 'wagmi';
import { KeepWhatsRaisedABI } from '@/contracts/abi/KeepWhatsRaised';
import { ethers } from '@/lib/web3';

export interface TreasuryWithdrawalStatusResult {
  isAuthorized: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to check on-chain withdrawal authorization status for a treasury.
 * Calls the treasury's getWithdrawalApprovalStatus() function.
 */
export function useTreasuryWithdrawalStatus(
  treasuryAddress?: string | null,
): TreasuryWithdrawalStatusResult {
  const isValidAddress = treasuryAddress && ethers.isAddress(treasuryAddress);

  const {
    data: isAuthorized,
    isLoading,
    error,
  } = useReadContract({
    address: isValidAddress ? (treasuryAddress as `0x${string}`) : undefined,
    abi: KeepWhatsRaisedABI,
    functionName: 'getWithdrawalApprovalStatus',
    query: {
      enabled: isValidAddress,
      staleTime: 30000, // 30 seconds - on-chain status changes infrequently
      refetchInterval: 60000, // Refetch every minute
    },
  });

  return {
    isAuthorized: Boolean(isAuthorized),
    isLoading,
    error: error as Error | null,
  };
}
