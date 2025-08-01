'use client';

import { Button } from '@/components/ui';
import { useDonationCallback } from '@/hooks/use-donation';
import { type Campaign, DonationProcessStates } from '@/types/campaign';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { DonationProcessDisplay } from './process-display';

export function CampaignDonationWalletProcess({
  campaign,
  amount,
  selectedToken,
  donationToAkashic,
  anonymous,
  onProcessing,
}: {
  campaign: Campaign;
  amount: string;
  selectedToken: string;
  donationToAkashic: number;
  anonymous: boolean;
  onProcessing?: (processing: boolean) => void;
}) {
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const akashicAmount = useMemo(() => {
    if (donationToAkashic) {
      return (numericAmount * donationToAkashic) / 100;
    }
    return 0;
  }, [numericAmount, donationToAkashic]);
  const poolAmount = useMemo(() => {
    return numericAmount - akashicAmount;
  }, [numericAmount, akashicAmount]);
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
        setState('idle');
      }, 3000);

      return;
    }
  }, [state, onProcessing]);
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
        />
      </VisibilityToggle>
    </>
  );
}
