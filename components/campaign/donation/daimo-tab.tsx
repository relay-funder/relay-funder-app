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
import { NewsletterSignupLink } from '@/components/newsletter/newsletter-signup-link';
import { FeeInformation } from '@/components/shared/fee-information';
import { useQfMatchingEstimate } from '@/lib/hooks/useQfMatchingEstimate';

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
    paymentType,
  } = useDonationContext();

  const roundId = campaign.rounds?.[0]?.id;
  const { data: qfEstimate } = useQfMatchingEstimate({
    roundId: roundId ?? 0,
    campaignId: campaign.id,
    amount,
    enabled: !!roundId && !!amount && parseFloat(amount) > 0,
  });

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

  const handleDonateAgain = useCallback(() => {
    setIsPaymentCompleted(false);
    setIsProcessingPayment(false);
    setAmount('0'); // Reset amount as well
  }, [setIsPaymentCompleted, setIsProcessingPayment, setAmount]);

  return (
    <DaimoPayProvider theme="auto">
      <div className="relative flex flex-col gap-6">
        {/* Success Display */}
        {isPaymentCompleted && (
          <div className="mt-6 space-y-6 rounded-lg border border-border bg-card p-8 text-center text-card-foreground shadow-subtle">
            <CheckCircle2 className="mx-auto h-12 w-12 text-bio" />
            <div className="space-y-2">
              <p className="font-display text-lg font-semibold text-foreground">
                Donation Complete!
              </p>
              <p className="text-sm text-muted-foreground">
                Your donation has been successfully completed. Thank you!
              </p>
            </div>
            <div className="flex justify-center">
              <NewsletterSignupLink />
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
          {/* Fee Information Breakdown */}
          <div className="mb-6">
            <FeeInformation
              isDaimoPay={paymentType === 'daimo'}
              donationAmount={parseFloat(amount || '0')}
              tipAmount={parseFloat(tipAmount || '0')}
              qfMatch={qfEstimate ? parseFloat(qfEstimate.marginalMatch) : undefined}
              className="w-full"
            />
          </div>

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
