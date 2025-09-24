'use client';

import { useAuth } from '@/contexts';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { DetailContainer } from '@/components/layout';
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
      <DetailContainer variant="standard" padding="md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Wallet Information
            </h1>
          </div>

          <Web3ContextProvider>
            <ConnectedWalletInfo />
          </Web3ContextProvider>
        </div>
      </DetailContainer>
    </PageHome>
  );
}
