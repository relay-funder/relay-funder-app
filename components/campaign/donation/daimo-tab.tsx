'use client';

import { useState, useCallback } from 'react';
import { DbCampaign } from '@/types/campaign';
import { DaimoPayButtonComponent } from './daimo-button';
import { CampaignDonationWalletAmount } from './wallet/amount';
import { CampaignDonationWalletTip } from './wallet/tip';
import { CampaignDonationAnonymous } from './anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { DaimoPayProvider } from '@daimo/pay';
import { USD_TOKEN } from '@/lib/constant';
export function DaimoPayTab({ campaign }: { campaign: DbCampaign }) {
  const [selectedToken, setSelectedToken] = useState(USD_TOKEN);
  const [amount, setAmount] = useState('0');
  const [tipAmount, setTipAmount] = useState('0');
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAmountChanged = useCallback((newAmount: string) => {
    setAmount(newAmount);
  }, []);

  const handleTipAmountChanged = useCallback((newTipAmount: string) => {
    setTipAmount(newTipAmount);
  }, []);

  const handleEmailChanged = useCallback((newEmail: string) => {
    setEmail(newEmail);
  }, []);

  return (
    <DaimoPayProvider theme="auto">
      <div className="relative flex flex-col gap-6">
        <VisibilityToggle isVisible={!processing}>
          <div className="space-y-6">
            <CampaignDonationWalletAmount
              onAmountChanged={handleAmountChanged}
              onTokenChanged={setSelectedToken}
              amount={amount}
              selectedToken={selectedToken}
              email={email}
              onEmailChanged={handleEmailChanged}
            />

            {/* Two-column grid for tip and privacy settings on desktop */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CampaignDonationWalletTip
                tipAmount={tipAmount}
                amount={amount}
                selectedToken={selectedToken}
                onTipAmountChanged={handleTipAmountChanged}
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
