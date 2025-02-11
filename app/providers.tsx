'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { http } from 'wagmi';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { sepolia, celoAlfajores, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

const config = createConfig({
  chains: [sepolia, celoAlfajores, mainnet],
  transports: {
    [celoAlfajores.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

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
          <SidebarProvider>
            <CollectionProvider>
              {children}
            </CollectionProvider>
          </SidebarProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
