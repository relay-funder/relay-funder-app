'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { http } from 'wagmi';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { sepolia, celoAlfajores, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

const config = createConfig({
  chains: [sepolia, celoAlfajores, mainnet],
  transports: {
    [celoAlfajores.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          accentColor: '#44d29b',
          theme: '#FFFFFF',
          showWalletLoginFirst: false,
          logo: 'https://auth.privy.io/logos/privy-logo.png',
          walletChainType: 'ethereum-only',
        },
        loginMethods: ['email', 'wallet', 'google'],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
        defaultChain: celoAlfajores,
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <CollectionProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </CollectionProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
