'use client';

import { useAuth } from '@/contexts';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { PageDefaultContent } from '@/components/page/default-content';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ConnectedWalletInfo } from '@/components/profile/connected-wallet-info';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export default function WalletSettingsPage() {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <PageConnectWallet>Please connect your wallet</PageConnectWallet>;
  }

  return (
    <PageHome
      header={
        <PageHeader message="Manage your wallet for receiving payments and interacting with on-chain contracts."></PageHeader>
      }
    >
      <PageDefaultContent title="Wallet Information">
        <Web3ContextProvider>
          <ConnectedWalletInfo />
        </Web3ContextProvider>
      </PageDefaultContent>
    </PageHome>
  );
}
