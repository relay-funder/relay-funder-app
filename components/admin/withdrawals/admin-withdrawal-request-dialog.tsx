'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import { ADMIN_WITHDRAWALS_QUERY_KEY } from '@/lib/hooks/useAdminWithdrawals';
import { CAMPAIGNS_QUERY_KEY, resetCampaign } from '@/lib/hooks/useCampaigns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCampaignTreasuryBalance } from '@/lib/hooks/useTreasuryBalance';
import { formatUSD } from '@/lib/format-usd';
import { useAdminWithdrawals } from '@/lib/hooks/useAdminWithdrawals';

export type AdminWithdrawalRequestDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  campaignId: number;
  campaignTitle: string;
  treasuryAddress: string;
};

async function createAdminWithdrawalRequest(
  campaignId: number,
  amount: string,
  token: string,
  notes?: string | null,
) {
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/withdrawals`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, token, notes }),
    },
  );
  await handleApiErrors(response, 'Failed to create withdrawal request');
  return response.json();
}

export function AdminWithdrawalRequestDialog({
  open,
  onOpenChange,
  campaignId,
  campaignTitle,
  treasuryAddress,
}: AdminWithdrawalRequestDialogProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const initialFocusRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const { data: balanceData, isLoading: isBalanceLoading } =
    useCampaignTreasuryBalance(campaignId);

  // Fetch existing withdrawals to calculate truly available amount
  const { data: existingWithdrawalsData, isLoading: isWithdrawalsLoading } =
    useAdminWithdrawals({
      page: 1,
      pageSize: 100, // Get all withdrawals for this campaign
      filters: {
        campaignId,
        requestType: 'WITHDRAWAL_AMOUNT',
      },
    });

  const currency = useMemo(() => {
    return balanceData?.balance?.currency || 'USDT';
  }, [balanceData]);

  // Calculate available balance accounting for existing withdrawal requests
  const availableBalance = useMemo(() => {
    if (!balanceData?.balance) return 0;
    const onChainAvailable = parseFloat(balanceData.balance.available || '0');

    // Subtract existing withdrawal requests for the same token
    const existingAmount =
      existingWithdrawalsData?.reduce((sum, w) => {
        if (w.token === currency) {
          return sum + parseFloat(w.amount || '0');
        }
        return sum;
      }, 0) || 0;

    const trulyAvailable = onChainAvailable - existingAmount;
    return Math.max(0, trulyAvailable); // Don't go negative
  }, [balanceData, existingWithdrawalsData, currency]);

  const totalOnChainBalance = useMemo(() => {
    if (!balanceData?.balance) return 0;
    return parseFloat(balanceData.balance.available || '0');
  }, [balanceData]);

  const existingWithdrawalsTotal = useMemo(() => {
    return (
      existingWithdrawalsData?.reduce((sum, w) => {
        if (w.token === currency) {
          return sum + parseFloat(w.amount || '0');
        }
        return sum;
      }, 0) || 0
    );
  }, [existingWithdrawalsData, currency]);

  const createRequestMutation = useMutation({
    mutationFn: ({
      campaignId,
      amount,
      token,
      notes,
    }: {
      campaignId: number;
      amount: string;
      token: string;
      notes?: string | null;
    }) => createAdminWithdrawalRequest(campaignId, amount, token, notes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      resetCampaign(variables.campaignId, queryClient);
      onOpenChange?.(false);
      // Reset form
      setAmount('');
      setNotes('');
      setError(null);
    },
    onError: (err) => {
      setError(err.message || 'Failed to create withdrawal request');
    },
  });

  useEffect(() => {
    if (open) {
      setAmount('');
      setNotes('');
      setError(null);
      const t = setTimeout(() => initialFocusRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Validate amount in real-time (must be before early returns)
  const amountError = useMemo(() => {
    if (!amount) return null;
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    if (amountNum > availableBalance) {
      return `Amount exceeds available balance. Available: ${formatUSD(availableBalance)} ${currency}`;
    }
    if (amountNum > totalOnChainBalance) {
      return `Amount exceeds on-chain treasury balance. Treasury balance: ${formatUSD(totalOnChainBalance)} ${currency}`;
    }
    return null;
  }, [amount, availableBalance, totalOnChainBalance, currency]);

  const isSubmitting = createRequestMutation.isPending;

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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountNum = Number(amount);

    // Validate against truly available balance (accounting for existing withdrawals)
    if (amountNum > availableBalance) {
      setError(
        `Amount exceeds available balance. ` +
          `Available: ${formatUSD(availableBalance)} ${currency}. ` +
          `(On-chain balance: ${formatUSD(totalOnChainBalance)} ${currency}, ` +
          `Existing requests: ${formatUSD(existingWithdrawalsTotal)} ${currency})`,
      );
      return;
    }

    // Also validate against on-chain balance as a safety check
    if (amountNum > totalOnChainBalance) {
      setError(
        `Amount exceeds on-chain treasury balance of ${formatUSD(totalOnChainBalance)} ${currency}`,
      );
      return;
    }

    createRequestMutation.mutate({
      campaignId,
      amount,
      token: currency,
      notes: notes.trim() || null,
    });
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-withdrawal-request-dialog-title"
      aria-describedby="admin-withdrawal-request-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onOverlayClick} />
      <div className="relative z-10 w-[95vw] max-w-lg rounded-md border bg-background shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b p-5">
            <h2
              id="admin-withdrawal-request-dialog-title"
              className="text-lg font-semibold"
            >
              Create Withdrawal Request
            </h2>
            <p
              id="admin-withdrawal-request-dialog-description"
              className="mt-1 text-sm text-muted-foreground"
            >
              Create a withdrawal request for {campaignTitle}. This will be
              auto-approved and can be executed immediately.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-2 rounded-md border p-3">
              <div className="text-sm font-medium">Campaign</div>
              <div className="text-sm text-muted-foreground">
                {campaignTitle}
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <div className="text-sm font-medium">Available Balance</div>
              {isBalanceLoading || isWithdrawalsLoading ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-blue-600">
                    {formatUSD(availableBalance)} {currency}
                  </div>
                  {existingWithdrawalsTotal > 0 && (
                    <div className="text-xs text-muted-foreground">
                      On-chain: {formatUSD(totalOnChainBalance)} {currency} •
                      Existing requests: {formatUSD(existingWithdrawalsTotal)}{' '}
                      {currency}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-withdrawal-amount">Amount</Label>
              <Input
                id="admin-withdrawal-amount"
                ref={initialFocusRef}
                type="number"
                step="0.01"
                min="0"
                max={availableBalance}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null); // Clear error when user types
                }}
                placeholder="0.00"
                disabled={
                  isSubmitting || isBalanceLoading || isWithdrawalsLoading
                }
                className={`w-full ${amountError ? 'border-destructive' : ''}`}
              />
              {amountError && (
                <p className="text-sm text-destructive">{amountError}</p>
              )}
              {!amountError && amount && Number(amount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Remaining after this request:{' '}
                  {formatUSD(availableBalance - Number(amount))} {currency}
                </p>
              )}
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <div className="text-sm font-medium">Token</div>
              <div className="text-sm text-muted-foreground">{currency}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-withdrawal-notes">Notes (optional)</Label>
              <textarea
                id="admin-withdrawal-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for this withdrawal request"
                className="h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isBalanceLoading ||
                isWithdrawalsLoading ||
                !!amountError ||
                !amount ||
                Number(amount) <= 0
              }
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </div>
              ) : (
                'Create Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
