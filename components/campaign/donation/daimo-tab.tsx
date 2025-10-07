'use client';

import { useState } from 'react';
import { DbCampaign } from '@/types/campaign';
import { DaimoPayButtonComponent } from './daimo-button';
import { CampaignDonationWalletAmount } from './wallet/amount';
import { CampaignDonationWalletTip } from './wallet/tip';
import { CampaignDonationAnonymous } from './anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { DaimoPayProvider } from '@daimo/pay';
import { useUpdateProfileEmail, useUserProfile } from '@/lib/hooks/useProfile';

export function DaimoPayTab({ campaign }: { campaign: DbCampaign }) {
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const updateProfileEmail = useUpdateProfileEmail();
  const { data: profile } = useUserProfile();

  return (
    <DaimoPayProvider>
      <div className="relative flex flex-col gap-6">
        <VisibilityToggle isVisible={!processing}>
          <div className="space-y-6">
            <CampaignDonationWalletAmount
              onAmountChanged={setAmount}
              onTokenChanged={setSelectedToken}
              amount={amount}
              selectedToken={selectedToken}
              email={email}
              onEmailChanged={setEmail}
            />

            {/* Two-column grid for tip and privacy settings on desktop */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CampaignDonationWalletTip
                tipAmount={tipAmount}
                amount={amount}
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

        <DaimoPayButtonComponent
          campaign={campaign}
          amount={amount}
          tipAmount={tipAmount}
          email={email}
          anonymous={donationAnonymous}
          onPaymentStartedCallback={() => setProcessing(true)}
          onPaymentCompletedCallback={() => setProcessing(false)}
          onPaymentBouncedCallback={() => setProcessing(false)}
        />
      </div>
    </DaimoPayProvider>
  );
}
