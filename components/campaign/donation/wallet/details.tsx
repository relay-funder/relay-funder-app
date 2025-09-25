'use client';

import { useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletTip } from './tip';
import { CampaignDonationWalletProcess } from './process';
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
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  return (
    <div className="relative flex flex-col gap-6">
      <VisibilityToggle isVisible={!processing}>
        <div className="space-y-6">
          <CampaignDonationWalletAmount
            onAmountChanged={setAmount}
            onTokenChanged={setSelectedToken}
            amount={amount}
            selectedToken={selectedToken}
          />

          {/* Two-column grid for tip and privacy settings on desktop */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CampaignDonationWalletTip
              tipAmount={tipAmount}
              selectedToken={selectedToken}
              onTipAmountChanged={setTipAmount}
            />
            <CampaignDonationAnonymous
              anonymous={donationAnonymous}
              onChange={setDonationAnonymous}
            />
          </div>
        </div>
      </VisibilityToggle>
      <CampaignDonationWalletProcess
        campaign={campaign}
        amount={amount}
        tipAmount={tipAmount}
        donationToRelayFunder={0}
        selectedToken={selectedToken}
        anonymous={donationAnonymous}
        onProcessing={setProcessing}
      />
    </div>
  );
}
