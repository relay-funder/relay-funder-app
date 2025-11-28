'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui';
import { useExecuteKeepWhatsRaisedWithdrawal } from '@/lib/web3/hooks/useExecuteKeepWhatsRaisedWithdrawal';
import { useApproveWithdrawalOnChain } from '@/lib/web3/hooks/useApproveWithdrawalOnChain';
import { Loader2, Wallet } from 'lucide-react';
import { formatUSD } from '@/lib/format-usd';

export type ApproveDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (data: {
    transactionHash: string;
    notes?: string | null;
  }) => void | Promise<void>;
  defaultTransactionHash?: string | null;
  defaultNotes?: string | null;
  title?: string;
  description?: string;
  confirmText?: string;
  isSubmitting?: boolean;
  requestType?: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT';
  // For WITHDRAWAL_AMOUNT requests: withdrawal details needed to execute transaction
  treasuryAddress?: string | null;
  amount?: string;
  token?: string;
  campaignOwnerAddress?: string;
};

export function ApproveDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultTransactionHash = '',
  defaultNotes = '',
  title = 'Approve Withdrawal',
  description = 'Enter the transaction hash and optional note, then confirm approval.',
  confirmText = 'Approve',
  isSubmitting = false,
  requestType = 'WITHDRAWAL_AMOUNT',
  treasuryAddress,
  amount,
  token,
  campaignOwnerAddress,
}: ApproveDialogProps) {
  const [tx, setTx] = useState<string>(defaultTransactionHash ?? '');
  const [notes, setNotes] = useState<string>(defaultNotes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isExecutingTransaction, setIsExecutingTransaction] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);

  const {
    executeWithdrawal,
    isExecuting: isExecutingWithdrawal,
    error: withdrawalError,
    lastTxHash: withdrawalTxHash,
  } = useExecuteKeepWhatsRaisedWithdrawal();

  const {
    approveWithdrawal: approveWithdrawalOnChain,
    isExecuting: isExecutingAuthorization,
    error: authorizationError,
    lastTxHash: authorizationTxHash,
  } = useApproveWithdrawalOnChain();

  const isWithdrawalAmount = requestType === 'WITHDRAWAL_AMOUNT';
  const isOnChainAuth = requestType === 'ON_CHAIN_AUTHORIZATION';

  // Determine which transaction state to use based on request type
  const isExecutingOnChain = isWithdrawalAmount
    ? isExecutingWithdrawal
    : isExecutingAuthorization;
  const onChainError = isWithdrawalAmount ? withdrawalError : authorizationError;
  const onChainLastTxHash = isWithdrawalAmount
    ? withdrawalTxHash
    : authorizationTxHash;

  useEffect(() => {
    if (open) {
      setTx(defaultTransactionHash ?? '');
      setNotes(defaultNotes ?? '');
      setError(null);
      setIsExecutingTransaction(false);
      setHasAutoSubmitted(false);
      // small delay to ensure element exists in DOM before focusing
      if (!isWithdrawalAmount) {
        const t = setTimeout(() => initialFocusRef.current?.focus(), 10);
        return () => clearTimeout(t);
      }
    }
  }, [open, defaultTransactionHash, defaultNotes, isWithdrawalAmount]);

  // Handle transaction execution result for both WITHDRAWAL_AMOUNT and ON_CHAIN_AUTHORIZATION requests
  useEffect(() => {
    if (
      (isWithdrawalAmount || isOnChainAuth) &&
      onChainLastTxHash &&
      !isExecutingOnChain &&
      !onChainError &&
      onChainLastTxHash !== tx &&
      !hasAutoSubmitted
    ) {
      // Transaction successful, automatically proceed with approval
      setTx(onChainLastTxHash);
      setIsExecutingTransaction(false);
      setHasAutoSubmitted(true);
      // Automatically submit approval after transaction completes
      onConfirm?.({
        transactionHash: onChainLastTxHash,
        notes: notes.trim() ? notes.trim() : null,
      });
    } else if ((isWithdrawalAmount || isOnChainAuth) && onChainError) {
      setError(onChainError);
      setIsExecutingTransaction(false);
    }
  }, [
    isWithdrawalAmount,
    isOnChainAuth,
    onChainLastTxHash,
    isExecutingOnChain,
    onChainError,
    tx,
    notes,
    hasAutoSubmitted,
    onConfirm,
  ]);

  const isBrowser = useMemo(
    () => typeof window !== 'undefined' && typeof document !== 'undefined',
    [],
  );
  if (!isBrowser) return null;
  if (!open) return null;

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (
      e.target === e.currentTarget &&
      !isSubmitting &&
      !isExecutingOnChain &&
      !isExecutingTransaction
    ) {
      onOpenChange?.(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (
      e.key === 'Escape' &&
      !isSubmitting &&
      !isExecutingOnChain &&
      !isExecutingTransaction
    ) {
      onOpenChange?.(false);
    }
  }

  function validateTx(hash: string) {
    // Basic validation: must be non-empty; if looks like hex, check 0x prefix and length commonly 66 (32 bytes + 0x).
    if (!hash.trim()) return 'Transaction hash is required';
    if (hash.startsWith('0x') && hash.length < 10) {
      return 'Transaction hash looks too short';
    }
    return null;
  }

  async function handleExecuteTransaction() {
    if (!treasuryAddress) {
      setError('Treasury address is missing.');
      return;
    }

    setError(null);
    setIsExecutingTransaction(true);

    try {
      if (isWithdrawalAmount) {
        if (!amount) {
          setError('Withdrawal amount is missing.');
          setIsExecutingTransaction(false);
          return;
        }
        const result = await executeWithdrawal({
          treasuryAddress,
          amount,
        });

        if (!result.success || !result.hash) {
          throw new Error(result.error || 'Failed to execute withdrawal');
        }
        // Transaction hash will be set via useEffect when onChainLastTxHash updates
      } else if (isOnChainAuth) {
        const result = await approveWithdrawalOnChain({
          treasuryAddress: treasuryAddress as `0x${string}`,
        });

        if (!result.success || !result.hash) {
          throw new Error(
            result.error || 'Failed to execute on-chain authorization',
          );
        }
        // Transaction hash will be set via useEffect when onChainLastTxHash updates
      }
    } catch (err) {
      setError(
        (err as Error)?.message ||
          (isWithdrawalAmount
            ? 'Failed to execute withdrawal'
            : 'Failed to execute on-chain authorization'),
      );
      setIsExecutingTransaction(false);
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    // For both WITHDRAWAL_AMOUNT and ON_CHAIN_AUTHORIZATION: Execute transaction first if not already executed
    if ((isWithdrawalAmount || isOnChainAuth) && !tx) {
      await handleExecuteTransaction();
      return;
    }

    // Ensure we have a transaction hash before proceeding
    if (!tx) {
      setError('Transaction hash is required');
      return;
    }

    setError(null);
    await onConfirm?.({
      transactionHash: tx.trim(),
      notes: notes.trim() ? notes.trim() : null,
    });
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-dialog-title"
      aria-describedby="approve-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onOverlayClick} />
      <div className="relative z-10 w-[95vw] max-w-lg rounded-md border bg-background shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b p-5">
            <h2 id="approve-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p
                id="approve-dialog-description"
                className="mt-1 text-sm text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>

          <div className="space-y-4 p-5">
            {isWithdrawalAmount && treasuryAddress && amount && token && (
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Withdrawal Details</div>
                </div>
                <div className="text-lg font-semibold">
                  {formatUSD(Number(amount))} {token}
                </div>
                {campaignOwnerAddress && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Recipient (Campaign Owner)
                    </div>
                    <div className="break-all font-mono text-xs">
                      {campaignOwnerAddress}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOnChainAuth && treasuryAddress && (
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">
                    Treasury Authorization
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  This will enable withdrawals for the treasury. The authorization
                  is a one-time action that cannot be reversed.
                </div>
                <div className="break-all font-mono text-xs">
                  Treasury: {treasuryAddress}
                </div>
              </div>
            )}

            {(isWithdrawalAmount || isOnChainAuth) &&
              (isExecutingOnChain || isExecutingTransaction) && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Waiting for MetaMask transaction...</span>
                </div>
              )}

            {(isWithdrawalAmount || isOnChainAuth) && tx && (
              <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
                <div className="text-sm font-medium text-green-800">
                  Transaction Submitted
                </div>
                <div className="break-all font-mono text-xs text-green-700">
                  {tx}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="approve-notes" className="text-sm font-medium">
                Note (optional)
              </label>
              <textarea
                id="approve-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for this approval"
                className="h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange?.(false)}
              disabled={
                isSubmitting || isExecutingOnChain || isExecutingTransaction
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isExecutingOnChain || isExecutingTransaction}
            >
              {isSubmitting ? (
                'Approving...'
              ) : isExecutingOnChain || isExecutingTransaction ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Executing...
                </div>
              ) : (isWithdrawalAmount || isOnChainAuth) && !tx ? (
                isOnChainAuth ? 'Approve & Authorize' : 'Approve & Execute'
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
