'use client';

import { useNetworkCheck } from '@/hooks/use-network';
import { CampaignDonationWalletDetails } from './details';
import { CampaignDonationWalletStatus } from './status';
import { DbCampaign } from '@/types/campaign';

export function CampaignDonationWalletTab({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { isCorrectNetwork } = useNetworkCheck();

  return (
    <div className="flex flex-col gap-6">
      <CampaignDonationWalletStatus />

      {isCorrectNetwork && (
        <>
          {/* Temporarily hidden until proper rounds integration */}
          {/* <CampaignDonationDetailsEligible campaign={campaign} /> */}
          <CampaignDonationWalletDetails campaign={campaign} />
        </>
      )}
    </div>
  );
}
