/* eslint-disable @typescript-eslint/no-unused-vars */
import { useQuery } from '@tanstack/react-query';
import { useCampaignTreasuryBalance } from '@/lib/hooks/useTreasuryBalance';
import { useAdminPayments } from '@/lib/hooks/useAdminPayments';
import {
  useOnChainTransactions,
  OnChainTransaction,
  RawBlockExplorerTransaction,
} from './useOnChainTransactions';

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

  // Comparison data
  comparison: {
    totalDatabaseAmount: string;
    totalBlockchainAmount: string;
    difference: string;
    status: 'matched' | 'blockchain_short' | 'blockchain_surplus';
  };
}

const CAMPAIGN_RECONCILIATION_QUERY_KEY = 'campaign_reconciliation';

export function useCampaignReconciliation(campaignId: string) {
  // Get database payments (admin data with full user info)
  const { data: paymentsData } = useAdminPayments({
    page: 1,
    pageSize: 1000, // Get many payments for reconciliation
    filters: { campaignId: parseInt(campaignId) },
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
    queryFn: async (): Promise<CampaignReconciliationData> => {
      if (!paymentsData || !treasuryBalanceData?.balance) {
        throw new Error('Missing required data for reconciliation');
      }

      // onChainTransactionData might still be loading, handle gracefully
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

      console.log(
        'Reconciliation Hook - onChainTransactionData:',
        onChainTransactionData,
      );
      console.log(
        'Reconciliation Hook - rawBlockExplorerTransactions:',
        rawBlockExplorerTransactions,
      );
      console.log(
        'Reconciliation Hook - rawBlockExplorerTransactions length:',
        rawBlockExplorerTransactions.length,
      );

      // Calculate pledges from raw token transfers (USDC/USDT coming INTO the treasury)
      const treasuryAddress =
        treasuryBalanceData.treasuryAddress?.toLowerCase() || '';
      console.log(`Treasury address for comparison: ${treasuryAddress}`);

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

      console.log(
        `Processing ${rawBlockExplorerTransactions.length} raw blockchain transactions...`,
      );

      rawBlockExplorerTransactions.forEach((tx, index) => {
        console.log(
          `Transaction ${index + 1}: ${tx.hash}, status: ${tx.status}, type: ${tx.type}, tokenTransfers: ${tx.tokenTransfers?.length || 0}`,
        );

        if (
          tx.status === 'success' &&
          tx.tokenTransfers &&
          tx.tokenTransfers.length > 0
        ) {
          tx.tokenTransfers.forEach((transfer, transferIndex) => {
            console.log(
              `  Token Transfer ${transferIndex + 1}: ${transfer.tokenSymbol}, amount: ${transfer.amount}, decimals: ${transfer.decimals}, from: ${transfer.from.substring(0, 10)}..., to: ${transfer.to.substring(0, 10)}...`,
            );

            // Only count USDC/USDT transfers
            if (
              transfer.tokenSymbol === 'USDC' ||
              transfer.tokenSymbol === 'USDT'
            ) {
              const amount =
                parseFloat(transfer.amount) / Math.pow(10, transfer.decimals);
              console.log(
                `  -> Valid USDC/USDT transfer: ${amount} ${transfer.tokenSymbol}`,
              );

              // If transfer TO treasury = pledge (incoming)
              if (transfer.to.toLowerCase() === treasuryAddress) {
                console.log(
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
                console.log(
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
                console.log(
                  `  -> ✗ SKIPPED: Transfer not involving treasury (from: ${transfer.from.toLowerCase()}, to: ${transfer.to.toLowerCase()})`,
                );
              }
            } else {
              console.log(
                `  -> ✗ SKIPPED: Not USDC/USDT (token: ${transfer.tokenSymbol})`,
              );
            }
          });
        }
      });

      console.log(`\n=== RECONCILIATION SUMMARY ===`);
      console.log(`Pledges found: ${pledgeTransactionsList.length}`);
      pledgeTransactionsList.forEach((p) => {
        console.log(
          `  - ${p.amount} ${p.token} from ${p.from.substring(0, 10)}... (tx: ${p.tx.substring(0, 10)}...)`,
        );
      });
      console.log(`Total pledged on-chain: ${totalPledgedOnChain} USDC/USDT`);

      console.log(`\nWithdrawals found: ${withdrawalTransactionsList.length}`);
      withdrawalTransactionsList.forEach((w) => {
        console.log(
          `  - ${w.amount} ${w.token} to ${w.to.substring(0, 10)}... (tx: ${w.tx.substring(0, 10)}...)`,
        );
      });
      console.log(
        `Total withdrawn on-chain: ${totalWithdrawnOnChain} USDC/USDT`,
      );

      console.log(`\nDatabase total: ${totalDatabaseAmount} USD`);
      console.log(
        `Treasury balance: ${treasuryBalanceData.balance.totalPledged} ${treasuryBalanceData.balance.currency} (total pledged)`,
      );
      console.log(
        `Treasury available: ${treasuryBalanceData.balance.available} ${treasuryBalanceData.balance.currency} (available for withdrawal)`,
      );
      console.log(`=== END SUMMARY ===\n`);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        databasePayments: databasePayments as any,
        onChainBalance: treasuryBalanceData.balance,
        onChainTransactions,
        rawBlockExplorerTransactions: onChainData.rawTransactions,
        comparison: {
          totalDatabaseAmount,
          totalBlockchainAmount,
          difference: databaseVsBlockchainDiff.toFixed(6),
          status: blockchainVsDatabaseStatus,
        },
      };
    },
    enabled: !!paymentsData && !!treasuryBalanceData?.balance,
    // Don't cache stale data when on-chain data updates
    staleTime: onChainTransactionData ? 5 * 60 * 1000 : 0,
  });
}
