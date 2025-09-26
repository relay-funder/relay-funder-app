'use client';

import { useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationCreditCardAmount } from './amount';
import { CampaignDonationCreditCardProcess } from './process';
import { CampaignDonationRelayFunder } from '../relay-funder';
import { CampaignDonationAnonymous } from '../anonymous';
import { EmailCapture } from '../email-capture';
import { useEmailValidation } from '@/hooks/use-email-validation';

export function CampaignDonationDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [amount, setAmount] = useState('0');
  const [donationToRelayFunder, setDonationToRelayFunder] = useState(0);
  const [donationAnonymous, setDonationAnonymous] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { requiresEmail, hasEmail, email } = useEmailValidation();

  // Handle email capture completion
  const handleEmailComplete = (email: string) => {
    setUserEmail(email);
    setShowPaymentForm(true);
  };

  // If user has email, show payment form immediately
  const shouldShowPaymentForm = hasEmail || showPaymentForm;
  const finalEmail = userEmail || email;

  return (
    <div className="relative flex flex-col gap-4">
      <CampaignDonationCreditCardAmount
        onAmountChanged={setAmount}
        amount={amount}
      />
      <CampaignDonationRelayFunder onChange={setDonationToRelayFunder} />
      <CampaignDonationAnonymous
        anonymous={donationAnonymous}
        onChange={setDonationAnonymous}
      />

      {/* Email capture - show if user doesn't have email or if payment form isn't shown yet */}
      {requiresEmail && !showPaymentForm && (
        <EmailCapture onComplete={handleEmailComplete} required={true} />
      )}

      {/* Payment form - only show after email is captured or if user already has email */}
      {shouldShowPaymentForm && (
        <CampaignDonationCreditCardProcess
          campaign={campaign}
          amount={amount}
          donationToRelayFunder={donationToRelayFunder}
          anonymous={donationAnonymous}
          userEmail={finalEmail}
        />
      )}
    </div>
  );
}
