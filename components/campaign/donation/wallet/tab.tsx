'use client';

import { Loader2, MessageSquareWarning, Wallet } from 'lucide-react';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { useNetworkCheck } from '@/hooks/use-network';
import { useAuth as useWeb3Auth, chainConfig } from '@/lib/web3';
import { useAuth } from '@/contexts';
import { CampaignDonationDetails } from './details';
import { CampaignDonationDetailsEligible } from '@/components/campaign/donation/details-eligible';
import { Campaign } from '@/types/campaign';
import { Button } from '@/components/ui';

export function CampaignDonationTabWallet({
  campaign,
}: {
  campaign: Campaign;
}) {
  const { isCorrectNetwork } = useNetworkCheck();
  const { ready } = useWeb3Auth();
  const { authenticated, login } = useAuth();
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
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Loader2 className="animate-spin" />
          <span className="text-base font-semibold">Connecting to wallet</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Please wait while we detect your web3 browser wallet.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      {isCorrectNetwork ? (
        <>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">
              Saving gas fees, network {chainConfig.name} used.
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Save on gas fees, switch network.</span>
          </div>
          <PaymentSwitchWalletNetwork />
        </>
      )}
      <CampaignDonationDetailsEligible campaign={campaign} />
      <CampaignDonationDetails campaign={campaign} />
    </div>
  );
}
