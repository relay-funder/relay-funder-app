'use client';

import { useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { CampaignDonationCreditCardAmount } from './amount';
import { CampaignDonationCreditCardProcess } from './process';
import { CampaignDonationRelayFunder } from '../relay-funder';
import { CampaignDonationAnonymous } from '../anonymous';
import { EmailCapture } from '../email-capture';
import { useEmailValidation } from '@/hooks/use-email-validation';
import { useDonationContext } from '@/contexts';

export function CampaignDonationDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  // TODO: emails consolidation, for how we are having separate source of truths in this case
  // the last changes in this file were a mere refactor, as currently we are not using this payment method.
  const { email: userEmail, setEmail } = useDonationContext();
  const [donationToRelayFunder, setDonationToRelayFunder] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { requiresEmail, hasEmail, email } = useEmailValidation();

  // Handle email capture completion
  const handleEmailComplete = (email: string) => {
    setEmail(email);
    setShowPaymentForm(true);
  };

  // If user has email, show payment form immediately
  const shouldShowPaymentForm = hasEmail || showPaymentForm;
  const finalEmail = userEmail || email;

  return (
    <div className="relative flex flex-col gap-4">
      <CampaignDonationCreditCardAmount />
      <CampaignDonationRelayFunder onChange={setDonationToRelayFunder} />
      <CampaignDonationAnonymous />

      {/* Email capture - show if user doesn't have email or if payment form isn't shown yet */}
      {requiresEmail && !showPaymentForm && (
        <EmailCapture onComplete={handleEmailComplete} required={true} />
      )}

      {/* Payment form - only show after email is captured or if user already has email */}
      {shouldShowPaymentForm && (
        <CampaignDonationCreditCardProcess
          campaign={campaign}
          donationToRelayFunder={donationToRelayFunder}
          userEmail={finalEmail}
        />
      )}
    </div>
  );
}
