'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { WagmiProvider } from '@privy-io/wagmi';
import { celoAlfajores, sepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { EnvironmentProvider } from '@/components/environment-theme-provider';
import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { AuthProvider } from '@/contexts/AuthContext';
import { chainConfig } from '@/config/chain';

const config = createConfig({
  chains: [celoAlfajores, sepolia, mainnet],
  transports: {
      [celoAlfajores.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://alfajores-forno.celo-testnet.org"),
      [sepolia.id]: http(),
      [mainnet.id]: http(),
  },
  ssr: true,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
        loginMethods: ['email', 'wallet', 'google', 'github'],
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
              <EnvironmentProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </EnvironmentProvider>
            </CollectionProvider>
          </SidebarProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
