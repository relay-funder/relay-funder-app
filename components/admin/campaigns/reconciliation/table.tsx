'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Eye, ExternalLink } from 'lucide-react';
import {
  ReconciliationPayment,
  CampaignReconciliationData,
} from '@/lib/hooks/useCampaignReconciliation';
import { RawBlockExplorerTransaction } from '@/lib/hooks/useOnChainTransactions';
import { TokenTransfer } from '@/lib/block-explorer';
import { formatTokenAmount, getBlockExplorerTxUrl } from '@/lib/block-explorer';
import { FormattedDate } from '@/components/formatted-date';

interface CampaignReconciliationTableProps {
  campaignId: number;
  reconciliationData?: CampaignReconciliationData;
  isLoading: boolean;
  error?: Error;
}

export function CampaignReconciliationTable({
  campaignId,
  reconciliationData,
  isLoading,
  error,
}: CampaignReconciliationTableProps) {
  // Define explicit flags for blockchain loading state and transaction presence
  const isBlockchainLoading =
    reconciliationData?.isBlockchainDataLoading ?? true;
  const hasBlockchainTx =
    Array.isArray(reconciliationData?.rawBlockExplorerTransactions) &&
    reconciliationData.rawBlockExplorerTransactions.length > 0;

  // Memoize transaction processing for performance
  const processedTransactions = useMemo(() => {
    if (!reconciliationData) return null;

    // Combine and sort all transactions chronologically
    const allTransactions: Array<{
      type: 'database' | 'blockchain';
      date: Date;
      data: ReconciliationPayment | RawBlockExplorerTransaction;
    }> = [];

    // Add database payments
    reconciliationData.databasePayments?.forEach(
      (payment: ReconciliationPayment) => {
        allTransactions.push({
          type: 'database',
          date: new Date(payment.createdAt || payment.updatedAt || Date.now()),
          data: payment,
        });
      },
    );

    // Add blockchain transactions
    reconciliationData.rawBlockExplorerTransactions
      ?.filter(
        (tx: RawBlockExplorerTransaction) =>
          tx.status === 'success' &&
          tx.tokenTransfers?.some(
            (t: TokenTransfer) =>
              t.tokenSymbol === 'USDC' || t.tokenSymbol === 'USDT',
          ),
      )
      .forEach((tx: RawBlockExplorerTransaction) => {
        allTransactions.push({
          type: 'blockchain',
          date: new Date((tx.timestamp || 0) * 1000),
          data: tx,
        });
      });

    // Sort by date (chronological order: newest first)
    allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return allTransactions;
  }, [reconciliationData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Reconciliation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!reconciliationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No reconciliation data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reconciliation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Database Totals */}
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-700">Database Payments</h3>
              <div className="text-2xl font-bold text-blue-600">
                $
                {parseFloat(
                  reconciliationData.comparison.totalDatabaseAmount,
                ).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {reconciliationData.databasePayments?.length || 0} payments
                recorded (incl. tips)
              </div>
            </div>

            {/* Blockchain Totals */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold text-green-700">
                Blockchain Transactions
                {isBlockchainLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                )}
              </h3>
              {isBlockchainLoading ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">—</div>
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                      Fetching blockchain transaction data...
                    </span>
                  </div>
                </div>
              ) : !hasBlockchainTx ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">$0.00</div>
                  <div className="text-sm text-muted-foreground">
                    0 transactions found (incl. tips)
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    $
                    {parseFloat(
                      reconciliationData.comparison.totalBlockchainAmount,
                    ).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reconciliationData.rawBlockExplorerTransactions?.filter(
                      (tx: RawBlockExplorerTransaction) =>
                        tx.status === 'success' &&
                        tx.tokenTransfers?.some(
                          (t: TokenTransfer) =>
                            t.tokenSymbol === 'USDC' ||
                            t.tokenSymbol === 'USDT',
                        ),
                    ).length || 0}{' '}
                    transactions found (incl. tips)
                  </div>
                </>
              )}
            </div>

            {/* Difference */}
            {hasBlockchainTx ? (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Difference</h3>
                <div
                  className={`text-2xl font-bold ${
                    reconciliationData.comparison.status === 'matched'
                      ? 'text-green-600'
                      : reconciliationData.comparison.status ===
                          'blockchain_short'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                  }`}
                >
                  $
                  {Math.abs(
                    parseFloat(reconciliationData.comparison.difference),
                  ).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {reconciliationData.comparison.status === 'matched'
                    ? '✅ Amounts match (incl. tips)'
                    : reconciliationData.comparison.status ===
                        'blockchain_short'
                      ? '❌ Blockchain short by this amount'
                      : '⚠️ Blockchain has surplus'}
                </div>
              </div>
            ) : isBlockchainLoading ? (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold text-gray-700">
                  Difference
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                </h3>
                <div className="text-sm text-muted-foreground">
                  Waiting for blockchain data to calculate difference...
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Difference</h3>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <div className="text-sm text-muted-foreground">
                  No blockchain transactions yet
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unified Reconciliation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Transaction Reconciliation
            {isBlockchainLoading && (
              <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
                Loading blockchain data...
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">ID/Hash</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">User</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Payment Type
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Base Amount
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Tip</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedTransactions && processedTransactions.length > 0 ? (
                  processedTransactions.map((transaction) => {
                    if (transaction.type === 'database') {
                      const payment = transaction.data as ReconciliationPayment;
                      const baseAmount = payment.metadata?.pledgeAmount
                        ? parseFloat(payment.metadata.pledgeAmount)
                        : parseFloat(payment.amount);
                      const tipAmount = payment.tipAmount
                        ? parseFloat(payment.tipAmount)
                        : 0;
                      const totalAmount = baseAmount + tipAmount;

                      return (
                        <tr
                          key={`db-${payment.id}`}
                          className="border-b bg-yellow-50/30 hover:bg-blue-50/50 dark:bg-yellow-950/10 dark:hover:bg-blue-950/10"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Database
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">
                            Payment #{payment.id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <FormattedDate
                              date={
                                new Date(
                                  payment.createdAt ||
                                    payment.updatedAt ||
                                    transaction.date,
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {payment.isAnonymous
                              ? 'Anonymous'
                              : payment.user?.username ||
                                payment.user?.firstName ||
                                (payment.user?.address
                                  ? `${payment.user.address.slice(0, 6)}...${payment.user.address.slice(-4)}`
                                  : 'Unknown')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {payment.provider === 'daimo' ? (
                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                Daimo Pay
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Direct
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            ${baseAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            ${tipAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-600">
                            ${totalAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`/admin/payments?campaignId=${campaignId}&paymentId=${payment.id.toString()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View
                              </a>
                            </Button>
                          </td>
                        </tr>
                      );
                    } else {
                      const tx =
                        transaction.data as RawBlockExplorerTransaction;
                      const usdTransfers =
                        tx.tokenTransfers?.filter(
                          (transfer: TokenTransfer) =>
                            transfer.tokenSymbol === 'USDC' ||
                            transfer.tokenSymbol === 'USDT',
                        ) || [];
                      const totalAmount = usdTransfers.reduce(
                        (sum: number, transfer: TokenTransfer) => {
                          return (
                            sum +
                            parseFloat(
                              formatTokenAmount(
                                transfer.amount,
                                transfer.decimals,
                              ),
                            )
                          );
                        },
                        0,
                      );

                      return (
                        <tr
                          key={`chain-${tx.hash}`}
                          className="border-b hover:bg-green-50/50 dark:hover:bg-green-950/10"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Blockchain
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {tx.hash?.slice(0, 10)}...{tx.hash?.slice(-6)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <FormattedDate date={transaction.date} />
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            — (Block explorer)
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            — (On-chain)
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            — (Total only)
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            — (Not separated)
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-600">
                            ${totalAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={getBlockExplorerTxUrl(tx.hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                View
                              </a>
                            </Button>
                          </td>
                        </tr>
                      );
                    }
                  })
                ) : reconciliationData.databasePayments?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : !reconciliationData.rawBlockExplorerTransactions ||
                  reconciliationData.rawBlockExplorerTransactions.length ===
                    0 ? (
                  <>
                    {/* Show a loading row for blockchain data */}
                    <tr className="border-b bg-green-50/50 dark:bg-green-950/10">
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Blockchain
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-sm" colSpan={7}>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent"></div>
                          <span>
                            Fetching blockchain transaction details...
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-muted-foreground">—</span>
                      </td>
                    </tr>
                  </>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
