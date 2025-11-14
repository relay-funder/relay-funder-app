'use client';

import { useEffect } from 'react';

import { DbCampaign } from '@/types/campaign';
import { useDonationContext } from '@/contexts';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletTip } from './tip';
import { CampaignDonationWalletProcess } from './process';
import { CampaignDonationAnonymous } from '../anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { PaymentTotalSummary } from '../payment-total-summary';

export function CampaignDonationWalletDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { isProcessingPayment, clearDonation, amount, tipAmount } = useDonationContext();

  useEffect(() => {
    return () => {
      clearDonation();
    };
  }, [clearDonation]);

  return (
    <div className="relative flex flex-col gap-6">
      <VisibilityToggle isVisible={!isProcessingPayment}>
        <div className="space-y-6">
          <CampaignDonationWalletAmount />

          {/* Two-column grid for tip and privacy settings on desktop */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CampaignDonationWalletTip />
            <CampaignDonationAnonymous />
          </div>
        </div>
      </VisibilityToggle>

      <PaymentTotalSummary amount={amount} tipAmount={tipAmount} />

      <CampaignDonationWalletProcess campaign={campaign} />
    </div>
  );
}
