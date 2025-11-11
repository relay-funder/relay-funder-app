'use client';

import { useEffect } from 'react';
import { MessageSquareWarning } from 'lucide-react';
import { useAuth, useDonationContext } from '@/contexts';
import { CampaignDonationDetails } from './details';
import { CampaignDonationDetailsEligible } from '@/components/campaign/donation/details-eligible';
import { DbCampaign } from '@/types/campaign';
import { Button } from '@/components/ui';

export function CampaignDonationCreditCardTab({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { authenticated, login } = useAuth();
  const { clearDonation } = useDonationContext();

  useEffect(() => {
    return () => {
      clearDonation();
    };
  }, [clearDonation]);

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="mb-4 flex items-center space-x-2">
          <MessageSquareWarning />
          <span className="text-base font-semibold">
            You need to be signed in to donate
          </span>
        </div>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          To track your payments and the projects you support, it&#39;s crucial
          to sign in. Signing up with a wallet is free and easy, and no
          additional personal data is required to donate.
        </p>
        <div className="flex items-center justify-center">
          <Button onClick={login}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <CampaignDonationDetailsEligible campaign={campaign} />
      <CampaignDonationDetails campaign={campaign} />
    </div>
  );
}
