'use client';

import { useState } from 'react';

import { Campaign } from '@/types/campaign';
import { CampaignDonationWalletBalance } from './balance';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletAkashic } from './akashic';
import { CampaignDonationAnonymous } from '../anonymous';
import { CampaignDonationWalletProcess } from './process';

export function CampaignDonationDetails({ campaign }: { campaign: Campaign }) {
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState('0');
  const [donationToAkashic, setDonationToAkashic] = useState(0);
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  return (
    <div className="relative flex flex-col gap-4">
      <CampaignDonationWalletAmount
        onAmountChanged={setAmount}
        onTokenChanged={setSelectedToken}
        amount={amount}
        selectedToken={selectedToken}
      />
      <CampaignDonationWalletBalance selectedToken={selectedToken} />
      <CampaignDonationWalletAkashic onChange={setDonationToAkashic} />
      <CampaignDonationAnonymous
        anonymous={donationAnonymous}
        onChange={setDonationAnonymous}
      />
      <CampaignDonationWalletProcess
        campaign={campaign}
        onProcessing={setProcessing}
        amount={amount}
        donationToAkashic={donationToAkashic}
        selectedToken={selectedToken}
        anonymous={donationAnonymous}
      />
    </div>
  );
}
