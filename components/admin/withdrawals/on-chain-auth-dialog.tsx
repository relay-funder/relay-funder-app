'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApproveWithdrawalOnChain } from '@/lib/web3/hooks/useApproveWithdrawalOnChain';
import { useAuthorizeTreasury } from '@/lib/hooks/useAdminWithdrawals';
import { Loader2 } from 'lucide-react';

export type OnChainAuthDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (data: {
    transactionHash: string;
    notes?: string | null;
  }) => void | Promise<void>;
  treasuryAddress: `0x${string}`;
  campaignTitle: string;
  campaignId: number;
  defaultNotes?: string | null;
};

export function OnChainAuthDialog({
  open,
  onOpenChange,
  onConfirm,
  treasuryAddress,
  campaignTitle,
  campaignId,
  defaultNotes = '',
}: OnChainAuthDialogProps) {
  const [notes, setNotes] = useState<string>(defaultNotes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const {
    approveWithdrawal,
    isExecuting,
    error: hookError,
  } = useApproveWithdrawalOnChain();
  const { mutateAsync: authorizeTreasury, isPending: isAuthorizing } =
    useAuthorizeTreasury();

  useEffect(() => {
    if (open) {
      setNotes(defaultNotes ?? '');
      setError(null);
      setTxHash(null);
    }
  }, [open, defaultNotes]);

  async function handleExecuteOnChain() {
    try {
      setError(null);
      const result = await approveWithdrawal({ treasuryAddress });

      if (!result.success || !result.hash) {
        throw new Error(
          result.error || 'Failed to execute on-chain authorization',
        );
      }

      setTxHash(result.hash);

      // Record the authorization in the database
      try {
        await authorizeTreasury({
          campaignId,
          transactionHash: result.hash,
          notes: notes.trim() ? notes.trim() : null,
        });
      } catch (apiErr) {
        // Transaction succeeded but API call failed - still show success but warn
        console.error('Failed to record authorization:', apiErr);
        setError(
          'On-chain authorization succeeded but failed to record in database. Please contact support.',
        );
        return;
      }

      await onConfirm?.({
        transactionHash: result.hash,
        notes: notes.trim() ? notes.trim() : null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enable Treasury Withdrawals</DialogTitle>
          <DialogDescription>
            Execute on-chain authorization to enable withdrawals from this
            treasury. This is a one-time action per treasury.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 rounded-md border p-3">
            <div className="text-sm font-medium">Campaign</div>
            <div className="text-sm text-muted-foreground">{campaignTitle}</div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <div className="text-sm font-medium">Treasury Address</div>
            <div className="break-all font-mono text-xs text-muted-foreground">
              {treasuryAddress}
            </div>
          </div>

          {txHash ? (
            <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
              <div className="text-sm font-medium text-green-800">
                Transaction Submitted
              </div>
              <div className="break-all font-mono text-xs text-green-700">
                {txHash}
              </div>
              <div className="text-xs text-green-600">
                Waiting for confirmation...
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="auth-notes" className="text-sm font-medium">
                  Note (optional)
                </label>
                <textarea
                  id="auth-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for this authorization"
                  className="h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  disabled={isExecuting}
                />
              </div>

              {error || hookError ? (
                <div className="text-sm text-destructive">
                  {error || hookError || 'An error occurred'}
                </div>
              ) : null}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={isExecuting || isAuthorizing || !!txHash}
          >
            {txHash ? 'Close' : 'Cancel'}
          </Button>
          {!txHash && (
            <Button
              type="button"
              onClick={handleExecuteOnChain}
              disabled={isExecuting || isAuthorizing}
            >
              {isExecuting || isAuthorizing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isExecuting ? 'Executing...' : 'Recording...'}
                </div>
              ) : (
                'Execute On-Chain Authorization'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
