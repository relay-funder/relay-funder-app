'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts';
import { useUserProfile } from '@/lib/hooks/useProfile';
import { KycWalletAddressesForm } from '@/components/profile/kyc-wallet-addresses-form';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { PageDefaultContent } from '@/components/page/default-content';
import { PageLoading } from '@/components/page/loading';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ConnectedWalletInfo } from '@/components/profile/connected-wallet-info';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export default function WalletSettingsPage() {
  const { authenticated, isReady } = useAuth();
  const { data: profile, isPending: isProfilePending } = useUserProfile();
  const customerId = useMemo(
    () => profile?.crowdsplitCustomerId ?? null,
    [profile],
  );
  if (!authenticated) {
    return <PageConnectWallet>Please connect your wallet</PageConnectWallet>;
  }
  if (!isReady || isProfilePending) {
    return (
      <PageLoading>
        Please wait while we fetch your wallet information.
      </PageLoading>
    );
  }

  return (
    <PageHome
      header={
        <PageHeader message="Manage your wallet addresses for receiving payments."></PageHeader>
      }
    >
      <PageDefaultContent title="Wallet Settings">
        <Web3ContextProvider>
          {customerId ? <KycWalletAddressesForm /> : <ConnectedWalletInfo />}
        </Web3ContextProvider>
      </PageDefaultContent>
    </PageHome>
  );
}
