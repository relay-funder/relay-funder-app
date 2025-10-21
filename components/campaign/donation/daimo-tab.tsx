'use client';

import { useState, useCallback, useEffect } from 'react';
import { DbCampaign } from '@/types/campaign';
import { DaimoPayButtonComponent } from './daimo-button';
import { CampaignDonationWalletAmount } from './wallet/amount';
import { CampaignDonationWalletTip } from './wallet/tip';
import { CampaignDonationAnonymous } from './anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { DaimoPayProvider } from '@daimo/pay';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export function DaimoPayTab({ campaign }: { campaign: DbCampaign }) {
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState('USD'); // Will be updated by config (USDC or USDT)
  const [amount, setAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [tipCalculated, setTipCalculated] = useState(false);

  const handleAmountChanged = useCallback((newAmount: string) => {
    setAmount(newAmount);
    setTipCalculated(false); // Reset tip calculation flag when amount changes
  }, []);

  const handleTipAmountChanged = useCallback((newTipAmount: string) => {
    setTipAmount(newTipAmount);
    setTipCalculated(true); // Mark tip as calculated
  }, []);

  const handleEmailChanged = useCallback((newEmail: string) => {
    setEmail(newEmail);
  }, []);

  const handlePaymentCompleted = useCallback(() => {
    setProcessing(false);
    setPaymentCompleted(true);
  }, []);

  const handlePaymentBounced = useCallback(() => {
    setProcessing(false);
    setPaymentCompleted(false);
  }, []);

  const handleViewCampaign = useCallback(() => {
    router.push(`/campaigns/${campaign.slug}`);
  }, [router, campaign.slug]);

  const handleDonateAgain = useCallback(() => {
    setPaymentCompleted(false);
    setProcessing(false);
  }, []);

  // Trigger initial tip calculation when component mounts
  useEffect(() => {
    if (amount === '0') {
      setTipCalculated(true); // Allow button to render with 0 amount initially
    }
  }, [amount]);

  return (
    <DaimoPayProvider theme="auto">
      <div className="relative flex flex-col gap-6">
        {/* Success Display */}
        {paymentCompleted && (
          <div className="mt-4 space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
            <div className="space-y-2">
              <p className="font-display text-lg font-semibold text-foreground">
                Donation Complete!
              </p>
              <p className="text-sm text-muted-foreground">
                Your donation has been successfully completed. Thank you for
                your support!
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
              <Button onClick={handleViewCampaign} variant="default">
                View Campaign
              </Button>
              <Button onClick={handleDonateAgain} variant="outline">
                Donate Again
              </Button>
            </div>
          </div>
        )}

        <VisibilityToggle isVisible={!processing && !paymentCompleted}>
          <div className="space-y-6">
            <CampaignDonationWalletAmount
              onAmountChanged={handleAmountChanged}
              onTokenChanged={setSelectedToken}
              amount={amount}
              selectedToken={selectedToken}
              email={email}
              onEmailChanged={handleEmailChanged}
            />

            {/* Two-column grid for tip and privacy settings on desktop */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CampaignDonationWalletTip
                tipAmount={tipAmount}
                amount={amount}
                selectedToken={selectedToken}
                onTipAmountChanged={handleTipAmountChanged}
              />
              <CampaignDonationAnonymous
                anonymous={donationAnonymous}
                onChange={setDonationAnonymous}
              />
            </div>
          </div>
        </VisibilityToggle>

        <VisibilityToggle isVisible={!paymentCompleted}>
          {/* Only render Daimo Pay button after tip calculation is complete */}
          {tipCalculated && (
            <DaimoPayButtonComponent
              campaign={campaign}
              amount={amount}
              tipAmount={tipAmount}
              email={email}
              anonymous={donationAnonymous}
              onPaymentStartedCallback={() => setProcessing(true)}
              onPaymentCompletedCallback={handlePaymentCompleted}
              onPaymentBouncedCallback={handlePaymentBounced}
            />
          )}
        </VisibilityToggle>
      </div>
    </DaimoPayProvider>
  );
}
