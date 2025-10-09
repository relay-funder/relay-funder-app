'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';
import { useTreasuryBalance } from '@/hooks/use-treasury-balance';
import { useUserProfile } from '@/lib/hooks/useProfile';
import {
  useRequestWithdrawal,
  useWithdrawalApproval,
} from '@/lib/hooks/useWithdrawals';
import { useExecuteWithdrawal } from '@/lib/web3/hooks/useExecuteWithdrawal';
import { formatUSD } from '@/lib/format-usd';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { AlertTriangle, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { normalizeAddress } from '@/lib/normalize-address';

type WithdrawalStep = 'amount' | 'review' | 'executing' | 'submitted';

export interface WithdrawalDialogProps {
  campaign: DbCampaign;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode; // Optional custom trigger; if not provided, a default button will be rendered
  className?: string;
}

/**
 * WithdrawalDialog
 * - Step 1: Enter amount (shows available balance via useTreasuryBalance)
 * - Step 2: Review amount + recipient address; highlight if connected wallet != recipient address; link to profile/wallet
 * - Step 3: If no prior approval, request withdrawal approval from admin
 * - Step 4: If prior approval exists, execute smart contract withdrawal and record in DB
 */
export function WithdrawalDialog({
  campaign,
  open,
  onOpenChange,
  trigger,
  className,
}: WithdrawalDialogProps) {
  const isControlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const dialogOpen = isControlled ? (open as boolean) : internalOpen;
  const setDialogOpen = useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [isControlled, onOpenChange],
  );

  const [step, setStep] = useState<WithdrawalStep>('amount');
  const [amount, setAmount] = useState<string>('');

  // Load balances for available amount
  const treasuryAddress = campaign?.treasuryAddress ?? null;
  const { data: treasuryBalance, isLoading: isBalanceLoading } =
    useTreasuryBalance(treasuryAddress);

  // User and profile (for recipient wallet)
  const { address: connectedAddress } = useAuth();
  const { data: profile } = useUserProfile();

  // Check if campaign has withdrawal approval
  const { data: approvalData } = useWithdrawalApproval(campaign?.id);

  // Prepare displayed data
  const currency = useMemo<string>(() => {
    return treasuryBalance?.balance?.currency ?? 'USDC';
  }, [treasuryBalance]);

  const availableFloat = useMemo<number>(() => {
    const available = treasuryBalance?.balance?.available ?? '0';
    const parsed = parseFloat(available || '0');
    return Number.isFinite(parsed) ? parsed : 0;
  }, [treasuryBalance]);
  const token = currency; // use API token the same as currency string (ex. 'USDC')

  const enabled = availableFloat > 0;
  const hasApproval = useMemo<boolean>(() => {
    return approvalData?.hasApproval ?? false;
  }, [approvalData]);

  const recipientAddress = useMemo<string | null>(() => {
    // If user set a recipientWallet in profile, prefer that; else use profile.address
    return normalizeAddress(
      profile?.recipientWallet?.trim()
        ? profile.recipientWallet.trim()
        : (profile?.address ?? null),
    );
  }, [profile]);

  const isMismatch = useMemo<boolean>(() => {
    if (!connectedAddress || !recipientAddress) return false;
    return connectedAddress !== recipientAddress;
  }, [connectedAddress, recipientAddress]);

  // Form validation
  const amountNumber = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const amountError = useMemo<string | null>(() => {
    if (!amount || amount.trim() === '') return 'Enter an amount';
    if (Number.isNaN(amountNumber)) return 'Amount must be a number';
    if (amountNumber <= 0) return 'Amount must be greater than 0';
    if (amountNumber > availableFloat)
      return `Amount exceeds available balance (${formatUSD(availableFloat)} ${currency})`;
    return null;
  }, [amount, amountNumber, availableFloat, currency]);

  // Mutation to request a withdrawal
  const { toast } = useToast();
  const { mutateAsync: requestWithdrawal, isPending: isSubmitting } =
    useRequestWithdrawal();

  // Hook to execute direct withdrawal
  const { executeWithdrawal, isExecuting: isExecutingWithdrawal } =
    useExecuteWithdrawal();

  const resetLocalState = useCallback(() => {
    setStep('amount');
    setAmount('');
  }, []);

  useEffect(() => {
    if (!dialogOpen) {
      // Reset internal state when dialog closes
      resetLocalState();
    }
  }, [dialogOpen, resetLocalState]);

  const handleProceedToReview = useCallback(() => {
    if (!amountError) {
      setStep('review');
    }
  }, [amountError]);

  const handleBackToAmount = useCallback(() => {
    setStep('amount');
  }, []);

  const handleConfirmAndSubmit = useCallback(async () => {
    if (hasApproval) {
      // Direct withdrawal: execute contract first
      setStep('executing');
      try {
        const result = await executeWithdrawal({
          treasuryAddress: treasuryAddress!,
          amount: String(amountNumber),
        });
        if (!result.success || !result.hash) {
          throw new Error(result.error || 'Failed to execute withdrawal');
        }
        // Now record in DB
        await requestWithdrawal({
          campaignId: campaign.id,
          amount: amountNumber,
          token,
          transactionHash: result.hash,
        });
        setStep('submitted');
        toast({
          title: 'Withdrawal executed',
          description: 'Your withdrawal has been completed successfully.',
        });
      } catch (err) {
        setStep('review'); // Go back to review on error
        const message =
          err instanceof Error ? err.message : 'Failed to execute withdrawal';
        toast({
          title: 'Withdrawal failed',
          description: message,
          variant: 'destructive',
        });
      }
    } else {
      // Request approval
      try {
        await requestWithdrawal({
          campaignId: campaign.id,
          amount: amountNumber,
          token,
        });
        setStep('submitted');
        toast({
          title: 'Withdrawal requested',
          description:
            'Your withdrawal request has been submitted. An admin will review and approve it shortly.',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to request withdrawal';
        toast({
          title: 'Request failed',
          description: message,
          variant: 'destructive',
        });
      }
    }
  }, [
    hasApproval,
    executeWithdrawal,
    treasuryAddress,
    amountNumber,
    requestWithdrawal,
    campaign.id,
    token,
    toast,
  ]);

  const handleDone = useCallback(() => {
    setDialogOpen(false);
  }, [setDialogOpen]);

  const defaultTrigger = (
    <Button className="h-12 w-full text-lg" size="lg" disabled={!campaign}>
      Withdraw funds
    </Button>
  );
  if (!enabled) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>
            {step === 'amount' &&
              (hasApproval ? 'Withdraw Funds' : 'Request Withdrawal Approval')}
            {step === 'review' &&
              (hasApproval
                ? 'Confirm Withdrawal'
                : 'Confirm Withdrawal Request')}
            {step === 'executing' && 'Executing Withdrawal'}
            {step === 'submitted' && 'Withdrawal Submitted'}
          </DialogTitle>
          <DialogDescription>
            {step === 'amount' &&
              'Enter the amount you wish to withdraw from the available balance.'}
            {step === 'review' &&
              (hasApproval
                ? 'Please review the details below before executing the withdrawal.'
                : 'Please review the details below before submitting your withdrawal request.')}
            {step === 'executing' &&
              'Executing the withdrawal on the blockchain. Please wait...'}
            {step === 'submitted' &&
              (hasApproval
                ? 'Your withdrawal has been executed and recorded.'
                : 'Your withdrawal request was created. An admin must approve it before funds are sent.')}
          </DialogDescription>
        </DialogHeader>

        {step === 'amount' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  Available balance
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isBalanceLoading ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <>
                    <span className="text-base font-medium">
                      {formatUSD(availableFloat)}
                    </span>
                    <Badge variant="outline">{currency}</Badge>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount to withdraw</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="withdraw-amount"
                  placeholder="0.00"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                  disabled={isBalanceLoading}
                />
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{currency}</Badge>
                </div>
              </div>
              {amountError ? (
                <p className="text-sm text-red-600">{amountError}</p>
              ) : null}
              {treasuryAddress ? null : (
                <p className="text-sm text-red-600">
                  No treasury available for this campaign. You cannot withdraw
                  funds yet.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">
                    {formatUSD(amountNumber)}
                  </span>
                  <Badge variant="outline">{currency}</Badge>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Withdrawal address
                </span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-gray-50 px-2 py-1 text-sm">
                    {recipientAddress}
                  </code>
                </div>
              </div>
            </div>

            {isMismatch && (
              <div className="rounded-md border border-red-300 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-700">
                      Connected wallet does not match your withdrawal address
                    </p>
                    <div className="text-sm text-red-700">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide">
                          Connected
                        </span>
                        <code className="rounded bg-white px-2 py-0.5">
                          {connectedAddress || ''}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide">
                          Recipient
                        </span>
                        <code className="rounded bg-white px-2 py-0.5">
                          {recipientAddress}
                        </code>
                      </div>
                    </div>
                    <p className="text-sm text-red-700">
                      Please verify the recipient address. You can update your
                      payout address in{' '}
                      <Link
                        href="/profile/wallet"
                        className="font-medium underline"
                        target="_blank"
                      >
                        Wallet Settings
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!recipientAddress && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800">
                      Missing withdrawal address
                    </p>
                    <p className="text-sm text-amber-800">
                      We could not determine a recipient address for your
                      profile. Please set one in{' '}
                      <Link
                        href="/profile/wallet"
                        className="font-medium underline"
                        target="_blank"
                      >
                        Wallet Settings
                      </Link>{' '}
                      before submitting.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'submitted' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-md border p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-700">
                  {hasApproval
                    ? 'Withdrawal completed'
                    : 'Withdrawal requested'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasApproval
                    ? `Your withdrawal of ${formatUSD(amountNumber)} ${currency} has been executed and recorded.`
                    : `Your request for ${formatUSD(amountNumber)} ${currency} has been created and will be reviewed by an admin. You will see the status update once it is approved.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          {step === 'amount' && (
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleProceedToReview}
                disabled={
                  !!amountError ||
                  isBalanceLoading ||
                  !treasuryAddress ||
                  !campaign
                }
              >
                Review
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button variant="outline" onClick={handleBackToAmount}>
                Back
              </Button>
              <Button
                onClick={handleConfirmAndSubmit}
                disabled={
                  isSubmitting ||
                  isExecutingWithdrawal ||
                  !recipientAddress ||
                  Number.isNaN(amountNumber) ||
                  amountNumber <= 0
                }
              >
                {isSubmitting || isExecutingWithdrawal ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {hasApproval ? 'Executing...' : 'Submitting...'}
                  </div>
                ) : hasApproval ? (
                  'Confirm and withdraw'
                ) : (
                  'Confirm and request'
                )}
              </Button>
            </>
          )}

          {step === 'submitted' && (
            <Button onClick={handleDone} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
