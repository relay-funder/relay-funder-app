'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';
import { useCampaignTreasuryBalance } from '@/lib/hooks/useTreasuryBalance';
import { useUserProfile } from '@/lib/hooks/useProfile';
import {
  useRequestWithdrawal,
  useWithdrawalApproval,
  useRequestTreasuryAuthorization,
  useCampaignWithdrawals,
} from '@/lib/hooks/useWithdrawals';
import { useExecuteKeepWhatsRaisedWithdrawal } from '@/lib/web3/hooks/useExecuteKeepWhatsRaisedWithdrawal';
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
import { USD_TOKEN } from '@/lib/constant';
import { TreasuryAuthorizationStatus } from '@/components/campaign/treasury-authorization-status';

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
  const { data: balanceData, isLoading: isBalanceLoading } =
    useCampaignTreasuryBalance(campaign?.id);

  // Fetch existing withdrawals to calculate truly available amount
  const { data: existingWithdrawalsData, isLoading: isWithdrawalsLoading } =
    useCampaignWithdrawals(campaign?.id);

  // User and profile (for recipient wallet)
  const { address: connectedAddress } = useAuth();
  const { data: profile } = useUserProfile();

  // Check if campaign has withdrawal approval
  const { data: approvalData } = useWithdrawalApproval(campaign?.id);

  // Prepare displayed data
  const currency = useMemo<string>(() => {
    return balanceData?.balance?.currency ?? USD_TOKEN;
  }, [balanceData]);

  // Calculate available balance accounting for existing withdrawal requests
  const availableBalance = useMemo<number>(() => {
    if (!balanceData?.balance) return 0;
    const onChainAvailable = parseFloat(balanceData.balance.available || '0');

    // Subtract existing withdrawal requests for the same token
    const existingAmount =
      existingWithdrawalsData?.reduce((sum, w) => {
        if (w.token === currency && w.requestType === 'WITHDRAWAL_AMOUNT') {
          return sum + parseFloat(w.amount || '0');
        }
        return sum;
      }, 0) || 0;

    const trulyAvailable = onChainAvailable - existingAmount;
    return Math.max(0, trulyAvailable); // Don't go negative
  }, [balanceData, existingWithdrawalsData, currency]);

  const totalOnChainBalance = useMemo<number>(() => {
    if (!balanceData?.balance) return 0;
    return parseFloat(balanceData.balance.available || '0');
  }, [balanceData]);

  const existingWithdrawalsTotal = useMemo<number>(() => {
    return (
      existingWithdrawalsData?.reduce((sum, w) => {
        if (w.token === currency && w.requestType === 'WITHDRAWAL_AMOUNT') {
          return sum + parseFloat(w.amount || '0');
        }
        return sum;
      }, 0) || 0
    );
  }, [existingWithdrawalsData, currency]);

  const executedWithdrawalsTotal = useMemo<number>(() => {
    return (
      existingWithdrawalsData?.reduce((sum, w) => {
        if (
          w.token === currency &&
          w.requestType === 'WITHDRAWAL_AMOUNT' &&
          w.transactionHash
        ) {
          return sum + parseFloat(w.amount || '0');
        }
        return sum;
      }, 0) || 0
    );
  }, [existingWithdrawalsData, currency]);

  const token = currency; // use API token the same as currency string (ex. 'USDT')

  const enabled = availableBalance > 0;
  const hasApproval = useMemo<boolean>(() => {
    return approvalData?.hasApproval ?? false;
  }, [approvalData]);
  const onChainAuthorized = useMemo<boolean>(() => {
    return approvalData?.onChainAuthorized ?? false;
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
    if (amountNumber > availableBalance) {
      return `Amount exceeds available balance. Available: ${formatUSD(availableBalance)} ${currency}`;
    }
    if (amountNumber > totalOnChainBalance) {
      return `Amount exceeds on-chain treasury balance. Treasury balance: ${formatUSD(totalOnChainBalance)} ${currency}`;
    }
    return null;
  }, [amount, amountNumber, availableBalance, totalOnChainBalance, currency]);

  // Mutation to request a withdrawal
  const { toast } = useToast();
  const { mutateAsync: requestWithdrawal, isPending: isSubmitting } =
    useRequestWithdrawal();
  const {
    mutateAsync: requestAuthorization,
    isPending: isRequestingAuthorization,
  } = useRequestTreasuryAuthorization();

  // Hook to execute direct withdrawal (using KeepWhatsRaised contract)
  const { executeWithdrawal, isExecuting: isExecutingWithdrawal } =
    useExecuteKeepWhatsRaisedWithdrawal();

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
    if (onChainAuthorized && hasApproval) {
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
      // Request approval (will be queued until on-chain authorization is complete)
      try {
        await requestWithdrawal({
          campaignId: campaign.id,
          amount: amountNumber,
          token,
        });
        setStep('submitted');
        const message = onChainAuthorized
          ? 'Your withdrawal request has been submitted. An admin will review and approve it shortly.'
          : 'Your withdrawal request has been submitted. It will be processed once the treasury is authorized on-chain by an admin.';
        toast({
          title: 'Withdrawal requested',
          description: message,
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
    onChainAuthorized,
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
              (onChainAuthorized && hasApproval
                ? 'Withdraw Funds'
                : 'Request Withdrawal')}
            {step === 'review' &&
              (onChainAuthorized && hasApproval
                ? 'Confirm Withdrawal'
                : 'Confirm Withdrawal Request')}
            {step === 'executing' && 'Executing Withdrawal'}
            {step === 'submitted' && 'Withdrawal Submitted'}
          </DialogTitle>
          <DialogDescription>
            {step === 'amount' &&
              'Enter the amount you wish to withdraw from the available balance.'}
            {step === 'review' &&
              (onChainAuthorized && hasApproval
                ? 'Please review the details below before executing the withdrawal.'
                : 'Please review the details below before submitting your withdrawal request.')}
            {step === 'executing' &&
              'Executing the withdrawal on the blockchain. Please wait...'}
            {step === 'submitted' &&
              (onChainAuthorized && hasApproval
                ? 'Your withdrawal has been executed and recorded.'
                : 'Your withdrawal request was created. An admin must approve it before funds are sent.')}
          </DialogDescription>
        </DialogHeader>

        {step === 'amount' && (
          <div className="space-y-6">
            <TreasuryAuthorizationStatus
              treasuryAddress={treasuryAddress}
              onChainAuthorized={onChainAuthorized}
              showLabel={true}
            />
            {!onChainAuthorized && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Treasury Not Authorized
                      </p>
                      <p className="text-sm text-amber-800">
                        Withdrawals are not yet enabled for this treasury. You
                        must request authorization before requesting withdrawal
                        amounts.
                      </p>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          await requestAuthorization(campaign.id);
                          toast({
                            title: 'Authorization requested',
                            description:
                              'Your request has been submitted. An admin will review and authorize withdrawals for this treasury.',
                          });
                          setDialogOpen(false);
                        } catch (err) {
                          toast({
                            title: 'Request failed',
                            description:
                              err instanceof Error
                                ? err.message
                                : 'Failed to request authorization',
                            variant: 'destructive',
                          });
                        }
                      }}
                      disabled={isRequestingAuthorization}
                      className="w-full"
                      variant="outline"
                    >
                      {isRequestingAuthorization ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Request Treasury Authorization
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-amber-700">
                      Once authorized, you can request withdrawal amounts below.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                  {executedWithdrawalsTotal > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Already withdrawn: {formatUSD(executedWithdrawalsTotal)}{' '}
                      {currency}
                    </div>
                  )}
                </div>
              )}
            </div>

            {onChainAuthorized && (
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
                    max={availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`flex-1 ${amountError ? 'border-destructive' : ''}`}
                    disabled={isBalanceLoading || isWithdrawalsLoading}
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currency}</Badge>
                  </div>
                </div>
                {amountError ? (
                  <p className="text-sm text-destructive">{amountError}</p>
                ) : null}
                {!amountError && amount && Number(amount) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Remaining after this request:{' '}
                    {formatUSD(availableBalance - Number(amount))} {currency}
                  </p>
                )}
              </div>
            )}
            {!treasuryAddress && (
              <p className="text-sm text-red-600">
                No treasury available for this campaign. You cannot withdraw
                funds yet.
              </p>
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <TreasuryAuthorizationStatus
              treasuryAddress={treasuryAddress}
              onChainAuthorized={onChainAuthorized}
              showLabel={true}
            />
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
                  isWithdrawalsLoading ||
                  !treasuryAddress ||
                  !campaign ||
                  !onChainAuthorized
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
                    {onChainAuthorized && hasApproval
                      ? 'Executing...'
                      : 'Submitting...'}
                  </div>
                ) : onChainAuthorized && hasApproval ? (
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
