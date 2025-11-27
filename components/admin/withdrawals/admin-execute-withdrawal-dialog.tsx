'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui';
import { useExecuteKeepWhatsRaisedWithdrawal } from '@/lib/web3/hooks/useExecuteKeepWhatsRaisedWithdrawal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import { ADMIN_WITHDRAWALS_QUERY_KEY } from '@/lib/hooks/useAdminWithdrawals';
import { CAMPAIGNS_QUERY_KEY, resetCampaign } from '@/lib/hooks/useCampaigns';
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

async function recordWithdrawalExecution(
  campaignId: number,
  withdrawalId: number,
  transactionHash: string,
) {
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/withdrawals/${withdrawalId}/execute`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash }),
    },
  );
  await handleApiErrors(response, 'Failed to record withdrawal execution');
  return response.json();
}

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
  const queryClient = useQueryClient();

  const {
    executeWithdrawal,
    isExecuting: isExecutingOnChain,
    error: onChainError,
    lastTxHash: onChainLastTxHash,
  } = useExecuteKeepWhatsRaisedWithdrawal();

  const recordExecutionMutation = useMutation({
    mutationFn: ({
      campaignId,
      withdrawalId,
      transactionHash,
    }: {
      campaignId: number;
      withdrawalId: number;
      transactionHash: string;
    }) => recordWithdrawalExecution(campaignId, withdrawalId, transactionHash),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      resetCampaign(variables.campaignId, queryClient);
      onOpenChange?.(false);
      setTxHash(null);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || 'Failed to record withdrawal execution');
    },
  });

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
      recordExecutionMutation.mutate({
        campaignId,
        withdrawalId,
        transactionHash: onChainLastTxHash,
      });
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
  ]);

  const isSubmitting = isExecutingOnChain || recordExecutionMutation.isPending;

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

  async function handleExecute() {
    setError(null);

    if (!treasuryAddress) {
      setError('Treasury address is missing.');
      return;
    }

    try {
      await executeWithdrawal({
        treasuryAddress,
        amount,
      });
    } catch (err) {
      setError((err as Error)?.message || 'Failed to execute withdrawal');
    }
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-execute-withdrawal-dialog-title"
      aria-describedby="admin-execute-withdrawal-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onOverlayClick} />
      <div className="relative z-10 w-[95vw] max-w-lg rounded-md border bg-background shadow-lg">
        <div className="border-b p-5">
          <h2
            id="admin-execute-withdrawal-dialog-title"
            className="text-lg font-semibold"
          >
            Execute Withdrawal
          </h2>
          <p
            id="admin-execute-withdrawal-dialog-description"
            className="mt-1 text-sm text-muted-foreground"
          >
            Execute the withdrawal on-chain. Funds will be sent to the campaign
            owner.
          </p>
        </div>

        <div className="space-y-4 p-5">
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

          {isExecutingOnChain && (
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

        <div className="flex items-center justify-end gap-2 border-t p-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleExecute} disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Executing...
              </div>
            ) : (
              'Execute Withdrawal'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
