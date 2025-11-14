import { useQuery } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';

export interface OnChainTransaction {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  amount: string;
  token: string;
  from: string;
  to: string;
  pledgeId?: string;
  tipAmount?: string;
  eventType: 'pledge' | 'withdrawal' | 'transfer';
}

export interface TokenTransfer {
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  decimals: number;
  from: string;
  to: string;
}

export interface RawBlockExplorerTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  fee: string;
  status: 'success' | 'failed';
  method?: string;
  type: 'native' | 'erc20' | 'contract';
  tokenTransfers?: TokenTransfer[];
}

export interface OnChainTransactionData {
  transactions: OnChainTransaction[];
  rawTransactions: RawBlockExplorerTransaction[];
}

const ON_CHAIN_TRANSACTIONS_QUERY_KEY = 'on_chain_transactions';

async function fetchOnChainTransactions(
  campaignId: string,
): Promise<OnChainTransactionData> {
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/on-chain-transactions`,
  );
  await handleApiErrors(response, 'Failed to fetch on-chain transactions');
  const data = await response.json();
  return {
    transactions: data.transactions || [],
    rawTransactions: data.rawTransactions || [],
  };
}

export function useOnChainTransactions(campaignId: string) {
  return useQuery<OnChainTransactionData, Error>({
    queryKey: [ON_CHAIN_TRANSACTIONS_QUERY_KEY, campaignId],
    queryFn: () => fetchOnChainTransactions(campaignId),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes - on-chain data changes infrequently
    refetchInterval: 10 * 60 * 1000, // 10 minutes - less aggressive refetching
    retry: (failureCount, error) => {
      // Don't retry on timeout errors to avoid long waits
      if (
        error.message?.includes('timeout') ||
        error.message?.includes('took too long')
      ) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
