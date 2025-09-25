'use client';

import { Loader2, MessageSquareWarning, Wallet } from 'lucide-react';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { useNetworkCheck } from '@/hooks/use-network';
import { useWeb3Auth, chainConfig } from '@/lib/web3';
import { useAuth } from '@/contexts';
import { CampaignDonationWalletDetails } from './details';
import { CampaignDonationWalletStatus } from './status';
import { CampaignDonationDetailsEligible } from '@/components/campaign/donation/details-eligible';
import { DbCampaign } from '@/types/campaign';
import { Button } from '@/components/ui';
import ContractLink from '@/components/page/contract-link';

export function CampaignDonationWalletTab({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { isCorrectNetwork } = useNetworkCheck();
  const { ready } = useWeb3Auth();
  const { authenticated, login } = useAuth();
  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Wallet />
          <span className="text-base font-semibold">
            You need to connect your wallet to contribute
          </span>
        </div>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          To track your payments and the projects you support, connect your
          wallet. It's free and easy, and no additional personal data is
          required to contribute.
        </p>
        <div className="flex items-center justify-center">
          <Button onClick={login}>Connect Wallet</Button>
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
    <div className="flex flex-col gap-6">
      <CampaignDonationWalletStatus campaign={campaign} />

      {isCorrectNetwork && (
        <>
          {/* Temporarily hidden until proper rounds integration */}
          {/* <CampaignDonationDetailsEligible campaign={campaign} /> */}
          <CampaignDonationWalletDetails campaign={campaign} />
        </>
      )}
    </div>
  );
}
