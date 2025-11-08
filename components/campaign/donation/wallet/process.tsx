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

export function CampaignDonationWalletProcess({
  campaign,
  donationToRelayFunder,
}: {
  campaign: DbCampaign;
  donationToRelayFunder: number;
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
    setIsProcessingPayment,
  } = useDonationContext();

  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const relayFundercAmount = useMemo(() => {
    if (donationToRelayFunder) {
      return (numericAmount * donationToRelayFunder) / 100;
    }
    return 0;
  }, [numericAmount, donationToRelayFunder]);
  const poolAmount = useMemo(() => {
    return numericAmount - relayFundercAmount;
  }, [numericAmount, relayFundercAmount]);
  const [state, setState] =
    useState<keyof typeof DonationProcessStates>('idle');
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
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const onDonateStart = useCallback(async () => {
    // Validate email first
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(email)) {
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

      // Proceed with donation (email will be included in payment metadata regardless)
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
  ]);
  useEffect(() => {
    // auto-reset state when done
    if (state === 'idle') {
      setProcessing(false);
      setIsProcessingPayment(false);
    }
    if (state === 'done') {
      setTimeout(() => {
        setIsProcessingPayment(false);
      }, 3000);

      return;
    }
  }, [state, setIsProcessingPayment]);
  const onDoneView = useCallback(() => {
    setState('idle');
    router.push(`/campaigns/${campaign.slug}`);
  }, [router, campaign]);
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
  }, [processingOnDonate, setIsProcessingPayment]);
  const isButtonDisabled =
    !numericAmount || processing || !email.trim() || !isValidEmail(email);

  function handleDonate() {
    onDonateStart();
  }
  return (
    <>
      <Button
        className="mb-6 w-full"
        size="lg"
        disabled={isButtonDisabled}
        onClick={handleDonate}
      >
        {processing ? 'Processing...' : `Contribute with Wallet`}
      </Button>
      <VisibilityToggle isVisible={state !== 'idle'}>
        <DonationProcessDisplay
          currentState={state}
          failureMessage={errorOnDonate}
          isProcessing={processing}
          onFailureCancel={() => setState('idle')}
          onFailureRetry={onDonateStart}
          onDoneView={onDoneView}
        />
      </VisibilityToggle>
    </>
  );
}
