'use client';

import { Button } from '@/components/ui';
import { useDonationCallback } from '@/hooks/use-donation';
import { type DbCampaign, DonationProcessStates } from '@/types/campaign';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { DonationProcessDisplay } from './process-display';
import { useRouter } from 'next/navigation';

export function CampaignDonationWalletProcess({
  campaign,
  amount,
  tipAmount = '0',
  selectedToken,
  donationToRelayFunder,
  anonymous,
  onProcessing,
}: {
  campaign: DbCampaign;
  amount: string;
  tipAmount?: string;
  selectedToken: string;
  donationToRelayFunder: number;
  anonymous: boolean;
  onProcessing?: (processing: boolean) => void;
}) {
  const router = useRouter();
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
    isAnonymous: anonymous,
    selectedToken,
    onStateChanged: setState,
  });
  const onDonateStart = useCallback(() => {
    if (typeof onProcessing === 'function') {
      onProcessing(true);
    }
    onDonate().catch((error) => {
      console.error('process:onDonate:catch', error);
      setProcessing(false);
    });
  }, [onDonate, onProcessing]);
  useEffect(() => {
    // auto-reset state when done
    if (state === 'idle') {
      setProcessing(false);
      if (typeof onProcessing === 'function') {
        onProcessing(false);
      }
    }
    if (state === 'done') {
      setTimeout(() => {
        if (typeof onProcessing === 'function') {
          onProcessing(false);
        }
      }, 3000);

      return;
    }
  }, [state, onProcessing]);
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
  }, [processingOnDonate, onProcessing]);
  return (
    <>
      <Button
        className="w-full"
        size="lg"
        disabled={!numericAmount || processing}
        onClick={onDonateStart}
      >
        {processing ? 'Processing...' : `Donate with Wallet`}
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
