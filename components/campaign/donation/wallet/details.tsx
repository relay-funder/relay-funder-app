'use client';

import { useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletBalance } from './balance';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletProcess } from './process';
import { CampaignDonationAkashic } from '../akashic';
import { CampaignDonationAnonymous } from '../anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';

export function CampaignDonationWalletDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('0');
  const [donationToAkashic, setDonationToAkashic] = useState(0);
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  return (
    <div className="relative flex flex-col gap-4">
      <VisibilityToggle isVisible={!processing}>
        <CampaignDonationWalletAmount
          onAmountChanged={setAmount}
          onTokenChanged={setSelectedToken}
          amount={amount}
          selectedToken={selectedToken}
        />
        <CampaignDonationWalletBalance selectedToken={selectedToken} />
        <CampaignDonationAkashic onChange={setDonationToAkashic} />
        <CampaignDonationAnonymous
          anonymous={donationAnonymous}
          onChange={setDonationAnonymous}
        />
      </VisibilityToggle>
      <CampaignDonationWalletProcess
        campaign={campaign}
        amount={amount}
        donationToAkashic={donationToAkashic}
        selectedToken={selectedToken}
        anonymous={donationAnonymous}
        onProcessing={setProcessing}
      />
    </div>
  );
}
