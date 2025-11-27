'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui';

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
}: ApproveDialogProps) {
  const [tx, setTx] = useState<string>(defaultTransactionHash ?? '');
  const [notes, setNotes] = useState<string>(defaultNotes ?? '');
  const [error, setError] = useState<string | null>(null);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTx(defaultTransactionHash ?? '');
      setNotes(defaultNotes ?? '');
      setError(null);
      // small delay to ensure element exists in DOM before focusing
      const t = setTimeout(() => initialFocusRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, defaultTransactionHash, defaultNotes]);

  const isBrowser = useMemo(
    () => typeof window !== 'undefined' && typeof document !== 'undefined',
    [],
  );
  if (!isBrowser) return null;
  if (!open) return null;

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !isSubmitting) {
      onOpenChange?.(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && !isSubmitting) {
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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const err = validateTx(tx);
    if (err) {
      setError(err);
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
            <div className="space-y-2">
              <label htmlFor="approve-tx" className="text-sm font-medium">
                Transaction Hash
                {requestType === 'ON_CHAIN_AUTHORIZATION' && (
                  <span className="ml-1 text-red-600">*</span>
                )}
              </label>
              <input
                id="approve-tx"
                ref={initialFocusRef}
                type="text"
                value={tx}
                onChange={(e) => setTx(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
                required
              />
              <p className="text-xs text-muted-foreground">
                {requestType === 'ON_CHAIN_AUTHORIZATION'
                  ? 'Execute the on-chain authorization first, then provide the transaction hash here. This enables withdrawals for the treasury.'
                  : 'Provide the blockchain transaction hash for this approval.'}
              </p>
            </div>

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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Approving...' : confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
