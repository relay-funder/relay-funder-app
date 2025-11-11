'use client';

import { useCallback, useEffect } from 'react';
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
import { useDonationContext } from '@/contexts';

export function DaimoPayTab({ campaign }: { campaign: DbCampaign }) {
  const router = useRouter();
  const {
    tipAmount,
    amount,
    email,
    isAnonymous,
    isProcessingPayment,
    isPaymentCompleted,
    setIsProcessingPayment,
    setIsPaymentCompleted,
    clearDonation,
    setAmount,
  } = useDonationContext();

  useEffect(() => {
    return () => {
      clearDonation();
    };
  }, [clearDonation]);

  const handlePaymentStarted = useCallback(() => {
    setIsProcessingPayment(true);
  }, [setIsProcessingPayment]);

  const handlePaymentCompleted = useCallback(() => {
    setIsProcessingPayment(false);
    setIsPaymentCompleted(true);
    setAmount('0');
  }, [setIsProcessingPayment, setIsPaymentCompleted, setAmount]);

  const handlePaymentBounced = useCallback(() => {
    setIsProcessingPayment(false);
    setIsPaymentCompleted(false);
  }, [setIsProcessingPayment, setIsPaymentCompleted]);

  const handleViewCampaign = useCallback(() => {
    router.push(`/campaigns/${campaign.slug}`);
  }, [router, campaign.slug]);

  // const handleDonateAgain = useCallback(() => {
  //   setIsPaymentCompleted(false);
  //   setIsProcessingPayment(false);
  // }, [setIsPaymentCompleted, setIsProcessingPayment]);

  return (
    <DaimoPayProvider theme="auto">
      <div className="relative flex flex-col gap-6">
        {/* Success Display */}
        {isPaymentCompleted && (
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
              {/* <Button onClick={handleDonateAgain} variant="outline">
                Donate Again
              </Button> */}
            </div>
          </div>
        )}

        <VisibilityToggle
          isVisible={!isProcessingPayment && !isPaymentCompleted}
        >
          <div className="space-y-6">
            <CampaignDonationWalletAmount />

            {/* Two-column grid for tip and privacy settings on desktop */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CampaignDonationWalletTip />
              <CampaignDonationAnonymous />
            </div>
          </div>
        </VisibilityToggle>

        <VisibilityToggle isVisible={!isPaymentCompleted}>
          {/* Total Amount Display */}
          {parseFloat(amount || '0') > 0 && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Total Amount:
                </span>
                <span className="text-lg font-bold text-foreground">
                  $
                  {(
                    parseFloat(amount || '0') + parseFloat(tipAmount || '0')
                  ).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Campaign: ${amount} • Platform tip: ${tipAmount}
              </div>
            </div>
          )}

          <DaimoPayButtonComponent
            campaign={campaign}
            amount={amount}
            tipAmount={tipAmount}
            email={email}
            anonymous={isAnonymous}
            onPaymentStartedCallback={handlePaymentStarted}
            onPaymentCompletedCallback={handlePaymentCompleted}
            onPaymentBouncedCallback={handlePaymentBounced}
          />
        </VisibilityToggle>
      </div>
    </DaimoPayProvider>
  );
}
