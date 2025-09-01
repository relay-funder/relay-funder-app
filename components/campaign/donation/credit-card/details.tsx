'use client';

import { useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationCreditCardAmount } from './amount';
import { CampaignDonationCreditCardProcess } from './process';
import { CampaignDonationAkashic } from '../akashic';
import { CampaignDonationAnonymous } from '../anonymous';

export function CampaignDonationDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [amount, setAmount] = useState('0');
  const [donationToAkashic, setDonationToAkashic] = useState(0);
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  return (
    <div className="relative flex flex-col gap-4">
      <CampaignDonationCreditCardAmount
        onAmountChanged={setAmount}
        amount={amount}
      />
      <CampaignDonationAkashic onChange={setDonationToAkashic} />
      <CampaignDonationAnonymous
        anonymous={donationAnonymous}
        onChange={setDonationAnonymous}
      />
      <CampaignDonationCreditCardProcess
        campaign={campaign}
        amount={amount}
        donationToAkashic={donationToAkashic}
        anonymous={donationAnonymous}
      />
    </div>
  );
}
