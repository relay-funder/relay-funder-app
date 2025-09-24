'use client';

import { useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletBalance } from './balance';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletTip } from './tip';
import { CampaignDonationWalletProcess } from './process';
import { CampaignDonationRelayFunder } from '../relay-funder';
import { CampaignDonationAnonymous } from '../anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';

export function CampaignDonationWalletDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [donationToRelayFunder, setDonationToRelayFunder] = useState(0);
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
        <CampaignDonationWalletTip
          tipAmount={tipAmount}
          selectedToken={selectedToken}
          onTipAmountChanged={setTipAmount}
        />
        <CampaignDonationWalletBalance selectedToken={selectedToken} />
        <CampaignDonationRelayFunder onChange={setDonationToRelayFunder} />
        <CampaignDonationAnonymous
          anonymous={donationAnonymous}
          onChange={setDonationAnonymous}
        />
      </VisibilityToggle>
      <CampaignDonationWalletProcess
        campaign={campaign}
        amount={amount}
        tipAmount={tipAmount}
        donationToRelayFunder={donationToRelayFunder}
        selectedToken={selectedToken}
        anonymous={donationAnonymous}
        onProcessing={setProcessing}
      />
    </div>
  );
}
