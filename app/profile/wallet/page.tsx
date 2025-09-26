'use client';

import { useAuth } from '@/contexts';
import { PageHome } from '@/components/page/home';
import { PageHeader } from '@/components/page/header';
import { DetailContainer } from '@/components/layout';
import { PageConnectWallet } from '@/components/page/connect-wallet';
import { ConnectedWalletInfo } from '@/components/profile/connected-wallet-info';
import { WalletPageSkeleton } from '@/components/profile/wallet-page-skeleton';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export default function WalletSettingsPage() {
  const { authenticated, isReady } = useAuth();

  if (!isReady) {
    return <WalletPageSkeleton />;
  }

  if (!authenticated) {
    return <PageConnectWallet>Please connect your wallet</PageConnectWallet>;
  }

  return (
    <PageHome
      header={
        <PageHeader message="Manage your wallet for receiving payments and interacting with on-chain contracts."></PageHeader>
      }
    >
      <DetailContainer variant="wide" padding="md">
        <div className="space-y-8">
          {/* Wallet Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Wallet Settings
            </h1>
            <p className="text-muted-foreground">
              View your connected wallet information, balances, and network
              details.
            </p>
          </div>

          <Web3ContextProvider>
            <ConnectedWalletInfo />
          </Web3ContextProvider>
        </div>
      </DetailContainer>
    </PageHome>
  );
}
