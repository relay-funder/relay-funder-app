/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCampaignTreasuryBalance } from '@/lib/hooks/useTreasuryBalance';
import { handleApiErrors } from '@/lib/api/error';
import { logFactory } from '@/lib/debug/log';
import type { AdminPaymentListItem } from '@/lib/api/adminPayments';
import type { TreasuryBalance } from '@/lib/treasury/interface';
import {
  useOnChainTransactions,
  useOnChainTransactionsStream,
  OnChainTransaction,
  RawBlockExplorerTransaction,
  OnChainTransactionData,
  StreamingProgress,
} from './useOnChainTransactions';

const logVerbose = logFactory('verbose', '🔍 Reconciliation', {
  flag: 'debug',
});

// Extended payment interface for admin reconciliation (includes metadata)
export interface ReconciliationPayment {
  id: number;
  amount: string;
  tipAmount?: string | null;
  token: string;
  status: string;
  type?: string;
  transactionHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isAnonymous: boolean;
  user: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
  campaign: {
    id: number;
    title: string;
    slug: string;
  };
  metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  provider?: string;
}

export interface CampaignReconciliationData {
  // Database data
  databasePayments: ReconciliationPayment[];

  // On-chain data
  onChainBalance: {
    available: string;
    totalPledged: string;
    currency: string;
  };

  onChainTransactions: OnChainTransaction[];
  rawBlockExplorerTransactions: RawBlockExplorerTransaction[];

  // Loading states
  isBlockchainDataLoading: boolean;

  // Streaming progress (only present when using streaming)
  streamingProgress?: StreamingProgress;

  // Comparison data
  comparison: {
    totalDatabaseAmount: string;
    totalBlockchainAmount: string;
    difference: string;
    status: 'matched' | 'blockchain_short' | 'blockchain_surplus';
  };
}

export const CAMPAIGN_RECONCILIATION_QUERY_KEY = 'campaign_reconciliation';

/**
 * Fetch all payments for a campaign for reconciliation purposes
 */
async function fetchCampaignPaymentsForReconciliation(
  campaignId: string,
): Promise<AdminPaymentListItem[]> {
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/reconciliation`,
  );
  await handleApiErrors(
    response,
    'Failed to fetch campaign payments for reconciliation',
  );
  const data = await response.json();
  return data.payments as AdminPaymentListItem[];
}

/**
 * Perform reconciliation logic between database and blockchain data
 */
function performReconciliation(
  paymentsData: AdminPaymentListItem[],
  treasuryBalanceData:
    | { balance: TreasuryBalance; treasuryAddress?: string }
    | undefined,
  onChainTransactionData: OnChainTransactionData | undefined,
): CampaignReconciliationData {
  if (!paymentsData || !treasuryBalanceData?.balance) {
    throw new Error('Missing required data for reconciliation');
  }

  // onChainTransactionData might still be loading, handle gracefully
  const isBlockchainDataLoading = onChainTransactionData === undefined;
  const onChainData = onChainTransactionData || {
    transactions: [],
    rawTransactions: [],
  };

  // Calculate totals with proper accounting for withdrawals
  const databasePayments = (paymentsData || []).map((payment) => ({
    ...payment,
    transactionHash: payment.transactionHash || undefined,
  })) as ReconciliationPayment[];
  const totalDatabaseAmount = databasePayments
    .filter((p) => p.status === 'confirmed')
    .reduce((total, payment) => {
      const baseAmount = parseFloat(String(payment.amount));
      const tipAmount = payment.tipAmount
        ? parseFloat(String(payment.tipAmount))
        : 0;
      return total + baseAmount + tipAmount;
    }, 0)
    .toString();

  // Separate pledges and withdrawals
  const onChainTransactions = onChainData.transactions || [];
  const rawBlockExplorerTransactions = onChainData.rawTransactions || [];

  logVerbose(
    'Reconciliation Hook - onChainTransactionData:',
    onChainTransactionData,
  );
  logVerbose(
    'Reconciliation Hook - rawBlockExplorerTransactions:',
    rawBlockExplorerTransactions,
  );
  logVerbose(
    'Reconciliation Hook - rawBlockExplorerTransactions length:',
    rawBlockExplorerTransactions.length,
  );

  // Calculate pledges from raw token transfers (USDC/USDT coming INTO the treasury)
  const treasuryAddress =
    treasuryBalanceData.treasuryAddress?.toLowerCase() || '';
  logVerbose(`Treasury address for comparison: ${treasuryAddress}`);

  let totalPledgedOnChain = 0;
  let totalWithdrawnOnChain = 0;
  const pledgeTransactionsList: Array<{
    tx: string;
    amount: number;
    token: string;
    from: string;
  }> = [];
  const withdrawalTransactionsList: Array<{
    tx: string;
    amount: number;
    token: string;
    to: string;
  }> = [];

  logVerbose(
    `Processing ${rawBlockExplorerTransactions.length} raw blockchain transactions...`,
  );

  rawBlockExplorerTransactions.forEach((tx, index) => {
    logVerbose(
      `Transaction ${index + 1}: ${tx.hash}, status: ${tx.status}, type: ${tx.type}, tokenTransfers: ${tx.tokenTransfers?.length || 0}`,
    );

    if (
      tx.status === 'success' &&
      tx.tokenTransfers &&
      tx.tokenTransfers.length > 0
    ) {
      tx.tokenTransfers.forEach((transfer, transferIndex) => {
        logVerbose(
          `  Token Transfer ${transferIndex + 1}: ${transfer.tokenSymbol}, amount: ${transfer.amount}, decimals: ${transfer.decimals}, from: ${transfer.from.substring(0, 10)}..., to: ${transfer.to.substring(0, 10)}...`,
        );

        // Only count USDC/USDT transfers
        if (
          transfer.tokenSymbol === 'USDC' ||
          transfer.tokenSymbol === 'USDT'
        ) {
          const amount =
            parseFloat(transfer.amount) / Math.pow(10, transfer.decimals);
          logVerbose(
            `  -> Valid USDC/USDT transfer: ${amount} ${transfer.tokenSymbol}`,
          );

          // If transfer TO treasury = pledge (incoming)
          if (transfer.to.toLowerCase() === treasuryAddress) {
            logVerbose(
              `  -> ✓ PLEDGE: ${amount} ${transfer.tokenSymbol} from ${transfer.from}`,
            );
            totalPledgedOnChain += amount;
            pledgeTransactionsList.push({
              tx: tx.hash,
              amount,
              token: transfer.tokenSymbol,
              from: transfer.from,
            });
          }
          // If transfer FROM treasury = withdrawal (outgoing)
          else if (transfer.from.toLowerCase() === treasuryAddress) {
            logVerbose(
              `  -> ✓ WITHDRAWAL: ${amount} ${transfer.tokenSymbol} to ${transfer.to}`,
            );
            totalWithdrawnOnChain += amount;
            withdrawalTransactionsList.push({
              tx: tx.hash,
              amount,
              token: transfer.tokenSymbol,
              to: transfer.to,
            });
          } else {
            logVerbose(
              `  -> ✗ SKIPPED: Transfer not involving treasury (from: ${transfer.from.toLowerCase()}, to: ${transfer.to.toLowerCase()})`,
            );
          }
        } else {
          logVerbose(
            `  -> ✗ SKIPPED: Not USDC/USDT (token: ${transfer.tokenSymbol})`,
          );
        }
      });
    }
  });

  logVerbose(`\n=== RECONCILIATION SUMMARY ===`);
  logVerbose(`Pledges found: ${pledgeTransactionsList.length}`);
  pledgeTransactionsList.forEach((p) => {
    logVerbose(
      `  - ${p.amount} ${p.token} from ${p.from.substring(0, 10)}... (tx: ${p.tx.substring(0, 10)}...)`,
    );
  });
  logVerbose(`Total pledged on-chain: ${totalPledgedOnChain} USDC/USDT`);

  logVerbose(`\nWithdrawals found: ${withdrawalTransactionsList.length}`);
  withdrawalTransactionsList.forEach((w) => {
    logVerbose(
      `  - ${w.amount} ${w.token} to ${w.to.substring(0, 10)}... (tx: ${w.tx.substring(0, 10)}...)`,
    );
  });
  logVerbose(`Total withdrawn on-chain: ${totalWithdrawnOnChain} USDC/USDT`);

  logVerbose(`\nDatabase total: ${totalDatabaseAmount} USD`);
  logVerbose(
    `Treasury balance: ${treasuryBalanceData.balance.totalPledged} ${treasuryBalanceData.balance.currency} (total pledged)`,
  );
  logVerbose(
    `Treasury available: ${treasuryBalanceData.balance.available} ${treasuryBalanceData.balance.currency} (available for withdrawal)`,
  );
  logVerbose(`=== END SUMMARY ===\n`);

  // Use totalPledged for reconciliation (what should be in treasury)

  // Calculate simple reconciliation metrics
  const totalBlockchainAmount = totalPledgedOnChain.toString();
  const databaseVsBlockchainDiff =
    parseFloat(totalDatabaseAmount) - totalPledgedOnChain;
  const blockchainVsDatabaseStatus =
    databaseVsBlockchainDiff > 0.01
      ? 'blockchain_short'
      : databaseVsBlockchainDiff < -0.01
        ? 'blockchain_surplus'
        : 'matched';

  return {
    databasePayments,
    onChainBalance: treasuryBalanceData.balance,
    onChainTransactions,
    rawBlockExplorerTransactions: onChainData.rawTransactions,
    isBlockchainDataLoading,
    comparison: {
      totalDatabaseAmount,
      totalBlockchainAmount,
      difference: databaseVsBlockchainDiff.toFixed(6),
      status: blockchainVsDatabaseStatus,
    },
  };
}

export function useCampaignReconciliation(campaignId: string) {
  // Get database payments (admin data with full user info)
  const { data: paymentsData } = useQuery({
    queryKey: ['campaign_payments_reconciliation', campaignId],
    queryFn: () => fetchCampaignPaymentsForReconciliation(campaignId),
    enabled: !!campaignId,
  });

  // Get treasury balance (on-chain)
  const { data: treasuryBalanceData } = useCampaignTreasuryBalance(
    parseInt(campaignId),
  );

  // Get on-chain transactions
  const { data: onChainTransactionData } = useOnChainTransactions(campaignId);

  return useQuery({
    queryKey: [
      CAMPAIGN_RECONCILIATION_QUERY_KEY,
      campaignId,
      onChainTransactionData ? 'with-onchain' : 'without-onchain',
    ],
    queryFn: (): CampaignReconciliationData => {
      return performReconciliation(
        paymentsData || [],
        treasuryBalanceData,
        onChainTransactionData,
      );
    },
    enabled: !!paymentsData && !!treasuryBalanceData?.balance,
    // Don't cache stale data when on-chain data updates
    staleTime: onChainTransactionData ? 5 * 60 * 1000 : 0,
  });
}

/**
 * Hook for streaming reconciliation data with progressive transaction loading
 * Ideal for campaigns with many transactions (50+) to avoid timeouts
 *
 * This hook provides real-time progress updates as blockchain transactions are fetched
 */
export function useCampaignReconciliationStream(campaignId: string) {
  // Get database payments (admin data with full user info)
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['campaign_payments_reconciliation', campaignId],
    queryFn: () => fetchCampaignPaymentsForReconciliation(campaignId),
    enabled: !!campaignId,
  });

  // Get treasury balance (on-chain)
  const { data: treasuryBalanceData, isLoading: treasuryLoading } =
    useCampaignTreasuryBalance(parseInt(campaignId));

  // Get on-chain transactions with streaming
  const {
    data: onChainTransactionData,
    progress,
    error: streamError,
    isLoading: streamLoading,
  } = useOnChainTransactionsStream(campaignId);

  // Use useMemo for streaming reconciliation to ensure it updates immediately
  const reconciliationResult = useMemo(() => {
    if (!paymentsData || !treasuryBalanceData?.balance) {
      return null;
    }

    const result = performReconciliation(
      paymentsData,
      treasuryBalanceData,
      onChainTransactionData,
    );

    return result;
  }, [
    paymentsData,
    treasuryBalanceData,
    onChainTransactionData,
    progress.isStreaming,
  ]);

  const reconciliationData = reconciliationResult ? {
    data: {
      ...reconciliationResult,
      streamingProgress: progress,
    },
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  } : {
    data: undefined,
    isLoading: true,
    error: null,
    refetch: () => Promise.resolve(),
  };

  return {
    ...reconciliationData,
    isLoading: paymentsLoading || treasuryLoading || streamLoading,
    error: reconciliationData.error || streamError,
    progress,
  };
}
