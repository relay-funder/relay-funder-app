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
import { useExecuteKeepWhatsRaisedWithdrawal } from '@/lib/web3/hooks/useExecuteKeepWhatsRaisedWithdrawal';
import {
  useRecordWithdrawalExecution,
  useValidateWithdrawal,
} from '@/lib/hooks/useAdminWithdrawals';
import { Loader2, AlertCircle, Wallet } from 'lucide-react';
import { formatUSD } from '@/lib/format-usd';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type AdminExecuteWithdrawalDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  campaignId: number;
  campaignTitle: string;
  campaignOwnerAddress: string;
  treasuryAddress: string;
  withdrawalId: number;
  amount: string;
  token: string;
};

export function AdminExecuteWithdrawalDialog({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
  campaignOwnerAddress,
  treasuryAddress,
  withdrawalId,
  amount,
  token,
}: AdminExecuteWithdrawalDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const {
    executeWithdrawal,
    isExecuting: isExecutingOnChain,
    error: onChainError,
    lastTxHash: onChainLastTxHash,
  } = useExecuteKeepWhatsRaisedWithdrawal();

  const recordExecutionMutation = useRecordWithdrawalExecution();
  const validateMutation = useValidateWithdrawal();

  useEffect(() => {
    if (open) {
      setTxHash(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (onChainLastTxHash && !isExecutingOnChain && !onChainError) {
      // On-chain transaction successful, now record in DB
      setTxHash(onChainLastTxHash);
      recordExecutionMutation.mutate(
        {
          campaignId,
          withdrawalId,
          transactionHash: onChainLastTxHash,
        },
        {
          onSuccess: () => {
            onOpenChange?.(false);
            setTxHash(null);
            setError(null);
          },
          onError: (err) => {
            setError(err.message || 'Failed to record withdrawal execution');
          },
        },
      );
    } else if (onChainError) {
      setError(onChainError);
    }
  }, [
    onChainLastTxHash,
    isExecutingOnChain,
    onChainError,
    campaignId,
    withdrawalId,
    recordExecutionMutation,
    onOpenChange,
  ]);

  const isSubmitting =
    isValidating || isExecutingOnChain || recordExecutionMutation.isPending;

  async function handleExecute() {
    setError(null);

    if (!treasuryAddress) {
      setError('Treasury address is missing.');
      return;
    }

    // Validate BEFORE executing on-chain transaction
    setIsValidating(true);
    try {
      await validateMutation.mutateAsync({ campaignId, withdrawalId });
    } catch (err) {
      setError((err as Error)?.message || 'Validation failed');
      setIsValidating(false);
      return;
    }
    setIsValidating(false);

    try {
      await executeWithdrawal({
        treasuryAddress,
        amount,
      });
    } catch (err) {
      setError((err as Error)?.message || 'Failed to execute withdrawal');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Execute Withdrawal</DialogTitle>
          <DialogDescription>
            Execute the withdrawal on-chain. Funds will be sent to the campaign
            owner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Important restriction notice */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Important Notice</AlertTitle>
            <AlertDescription className="text-amber-800">
              <strong>Funds will be sent to the campaign owner</strong>, not to
              your admin wallet. The smart contract enforces that withdrawals
              always go to{' '}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                {campaignOwnerAddress}
              </code>
              .
            </AlertDescription>
          </Alert>

          <div className="space-y-2 rounded-md border p-3">
            <div className="text-sm font-medium">Campaign</div>
            <div className="text-sm text-muted-foreground">{campaignTitle}</div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium">Withdrawal Amount</div>
            </div>
            <div className="text-lg font-semibold">
              {formatUSD(Number(amount))} {token}
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <div className="text-sm font-medium">
              Recipient (Campaign Owner)
            </div>
            <div className="break-all font-mono text-xs text-muted-foreground">
              {campaignOwnerAddress}
            </div>
          </div>

          {isValidating && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating withdrawal...</span>
            </div>
          )}
          {!isValidating && isExecutingOnChain && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for on-chain transaction...</span>
            </div>
          )}
          {recordExecutionMutation.isPending && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Recording withdrawal execution...</span>
            </div>
          )}
          {txHash && (
            <div className="space-y-2 rounded-md border border-green-200 bg-green-50 p-3">
              <div className="text-sm font-medium text-green-800">
                Transaction Submitted
              </div>
              <div className="break-all font-mono text-xs text-green-700">
                {txHash}
              </div>
            </div>
          )}
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleExecute} disabled={isSubmitting}>
            {isValidating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Validating...
              </div>
            ) : isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Executing...
              </div>
            ) : (
              'Execute Withdrawal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
