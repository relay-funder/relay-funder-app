import { useState, useEffect, useCallback } from 'react';
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
  fee?: string;
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

export interface StreamingProgress {
  isStreaming: boolean;
  totalCount: number;
  loadedCount: number;
  percentComplete: number;
}

export const ON_CHAIN_TRANSACTIONS_QUERY_KEY = 'on_chain_transactions';

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

/**
 * Hook for streaming on-chain transactions progressively
 * Ideal for campaigns with many transactions (50+) to avoid timeouts
 */
export function useOnChainTransactionsStream(campaignId: string) {
  const [data, setData] = useState<OnChainTransactionData>({
    transactions: [],
    rawTransactions: [],
  });
  const [progress, setProgress] = useState<StreamingProgress>({
    isStreaming: false,
    totalCount: 0,
    loadedCount: 0,
    percentComplete: 0,
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStream = useCallback(
    async (forceRefresh = false) => {
      if (!campaignId) return;

      // Check for cached data first (unless force refresh is requested)
      const cacheKey = `onchain_tx_${campaignId}`;
      const cachedData = forceRefresh ? null : localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const parsedCache = JSON.parse(cachedData);
          const cacheAge = Date.now() - parsedCache.timestamp;

          // Use cache if it's less than 30 minutes old
          if (cacheAge < 30 * 60 * 1000) {
            logVerbose(
              `Using cached blockchain data (${Math.round(cacheAge / 1000 / 60)} minutes old)`,
            );
            setData(parsedCache.data);
            setProgress({
              isStreaming: false,
              totalCount: parsedCache.data.rawTransactions.length,
              loadedCount: parsedCache.data.rawTransactions.length,
              percentComplete: 100,
            });
            setIsLoading(false);
            return;
          } else {
            // Cache is too old, remove it
            localStorage.removeItem(cacheKey);
          }
        } catch (cacheError) {
          // Invalid cache, remove it
          localStorage.removeItem(cacheKey);
        }
      }

      setIsLoading(true);
      setError(null);
      setProgress({
        isStreaming: true,
        totalCount: 0,
        loadedCount: 0,
        percentComplete: 0,
      });

      try {
        const response = await fetch(
          `/api/admin/campaigns/${campaignId}/on-chain-transactions?stream=true`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transactions: ${response.statusText}`,
          );
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const tempData: OnChainTransactionData = {
          transactions: [],
          rawTransactions: [],
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              try {
                const message = JSON.parse(jsonStr);

                switch (message.type) {
                  case 'smart_contract_transactions':
                    tempData.transactions = message.data;
                    setData({ ...tempData });
                    break;

                  case 'transaction_count':
                    setProgress((prev) => ({
                      ...prev,
                      totalCount: message.data.total,
                    }));
                    break;

                  case 'transaction':
                    tempData.rawTransactions.push(message.data);
                    const loadedCount = tempData.rawTransactions.length;
                    setData({ ...tempData });
                    setProgress((prev) => ({
                      ...prev,
                      loadedCount,
                      percentComplete:
                        prev.totalCount > 0
                          ? Math.round((loadedCount / prev.totalCount) * 100)
                          : 0,
                    }));
                    break;

                  case 'complete':
                    setProgress((prev) => ({
                      ...prev,
                      isStreaming: false,
                      percentComplete: 100,
                    }));
                    setIsLoading(false);

                    // Cache the final data
                    const cacheKey = `onchain_tx_${campaignId}`;
                    const cacheData = {
                      data: tempData,
                      timestamp: Date.now(),
                    };
                    try {
                      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                      logVerbose(
                        `Cached blockchain data for campaign ${campaignId}`,
                      );
                    } catch (cacheError) {
                      logVerbose(
                        `Failed to cache blockchain data:`,
                        cacheError,
                      );
                    }
                    break;

                  case 'error':
                    throw new Error(message.data.error || 'Streaming error');
                }
              } catch (parseError) {
                console.error('Failed to parse SSE message:', parseError);
              }
            }
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setProgress((prev) => ({ ...prev, isStreaming: false }));
        setIsLoading(false);
      }
    },
    [campaignId],
  );

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  const forceRefresh = useCallback(async () => {
    const cacheKey = `onchain_tx_${campaignId}`;
    localStorage.removeItem(cacheKey);
    await fetchStream(true); // Pass true to skip cache check
  }, [campaignId, fetchStream]);

  return {
    data,
    progress,
    error,
    isLoading,
    refetch: fetchStream,
    forceRefresh,
  };
}
