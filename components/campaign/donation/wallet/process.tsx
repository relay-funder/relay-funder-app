'use client';

import { Button } from '@/components/ui';
import { useDonationCallback } from '@/hooks/use-donation';
import { type DbCampaign, DonationProcessStates } from '@/types/campaign';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { DonationProcessDisplay } from './process-display';
import { useRouter } from 'next/navigation';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useDonationContext } from '@/contexts';
import { trackEvent } from '@/lib/analytics';
import { PROTOCOL_FEE_RATE } from '@/lib/constant';

export function CampaignDonationWalletProcess({
  campaign,
  state,
  setState,
}: {
  campaign: DbCampaign;
  state: keyof typeof DonationProcessStates;
  setState: (state: keyof typeof DonationProcessStates) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const updateProfileEmail = useUpdateProfileEmail();
  const { data: profile } = useUserProfile();
  const {
    amount,
    tipAmount,
    isAnonymous,
    email,
    token,
    usdFormattedBalance,
    setIsProcessingPayment,
    clearDonation,
  } = useDonationContext();

  const { hasUsdBalance } = usdFormattedBalance;

  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const poolAmount = useMemo(() => {
    return numericAmount;
  }, [numericAmount]);
  const [processing, setProcessing] = useState<boolean>(false);
  const {
    onDonate,
    isProcessing: processingOnDonate,
    error: errorOnDonate,
  } = useDonationCallback({
    campaign,
    amount,
    tipAmount,
    poolAmount,
    isAnonymous,
    selectedToken: token,
    userEmail: email,
    onStateChanged: setState,
  });
  const isValidEmail = (email: string) => {
    if (email.trim() === '') {
      return true;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const onDonateStart = useCallback(async () => {
    if (profile?.email && profile.email.trim() !== '' && !isValidEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }
    setIsProcessingPayment(true);
    try {
      // Only update profile if user doesn't already have an email set
      if (!profile?.email || profile.email.trim() === '') {
        await updateProfileEmail.mutateAsync({
          email,
        });
      }

      trackEvent('funnel_payment_initiated', {
        amount: numericAmount,
        currency: 'USDC',
        payment_method: 'wallet',
      });
      await onDonate();
    } catch (error) {
      console.error('process:onDonate:catch', error);
      setProcessing(false);
      setIsProcessingPayment(false);
    }
  }, [
    onDonate,
    setIsProcessingPayment,
    email,
    updateProfileEmail,
    toast,
    profile,
    numericAmount,
  ]);
  useEffect(() => {
    // auto-reset state when done
    if (state === 'idle') {
      setProcessing(false);
      setIsProcessingPayment(false);
    }
  }, [state, setIsProcessingPayment]);
  const onDoneView = useCallback(() => {
    setState('idle');
    router.push(`/campaigns/${campaign.slug}`);
  }, [router, campaign, setState]);
  const onDoneDonateAgain = useCallback(() => {
    clearDonation();
    setState('idle');
  }, [clearDonation, setState]);
  useEffect(() => {
    let deferTimerId = null;
    if (processingOnDonate) {
      setProcessing(true);
    } else {
      deferTimerId = setTimeout(() => {
        setProcessing(false);
      }, 1000);
    }
    return () => {
      if (!deferTimerId) {
        return;
      }
      clearTimeout(deferTimerId);
    };
  }, [processingOnDonate]);

  // Calculate total with protocol fee for accurate balance check
  const totalWithFee = useMemo(() => {
    const base = numericAmount;
    const tip = parseFloat(tipAmount || '0');
    const protocolFee = base * PROTOCOL_FEE_RATE;
    return base + protocolFee + tip;
  }, [numericAmount, tipAmount]);

  const isButtonDisabled =
    !hasUsdBalance ||
    !numericAmount ||
    processing ||
    !isValidEmail(email) ||
    (usdFormattedBalance.usdBalanceAmount > 0 &&
      totalWithFee > usdFormattedBalance.usdBalanceAmount);

  return (
    <>
      <VisibilityToggle isVisible={state === 'idle'}>
        <Button
          className="mb-6 w-full"
          size="lg"
          disabled={isButtonDisabled}
          onClick={onDonateStart}
        >
          {processing ? 'Processing...' : `Support Now`}
        </Button>
      </VisibilityToggle>
      <VisibilityToggle isVisible={state !== 'idle'}>
        <DonationProcessDisplay
          currentState={state}
          failureMessage={errorOnDonate}
          isProcessing={processing}
          onFailureCancel={() => setState('idle')}
          onFailureRetry={onDonateStart}
          onDoneView={onDoneView}
          onDoneDonateAgain={onDoneDonateAgain}
        />
      </VisibilityToggle>
    </>
  );
}
