'use client';

import { Loader2, Wallet } from 'lucide-react';
import { useNetworkCheck } from '@/hooks/use-network';
import { useWeb3Auth } from '@/lib/web3';
import { useAuth } from '@/contexts';
import { CampaignDonationWalletDetails } from './details';
import { CampaignDonationWalletStatus } from './status';
import { DbCampaign } from '@/types/campaign';
import { Button } from '@/components/ui';

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
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Wallet className="text-muted-foreground" />
          <span className="font-display text-base font-semibold text-foreground">
            You need to connect your wallet to contribute
          </span>
        </div>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          To track your payments and the projects you support, connect your
          wallet. It&apos;s free and easy, and no additional personal data is
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
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Loader2 className="animate-spin text-muted-foreground" />
          <span className="font-display text-base font-semibold text-foreground">
            Connecting to wallet
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Please wait while we detect your web3 browser wallet.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <CampaignDonationWalletStatus />

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
