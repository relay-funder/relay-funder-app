'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, sepolia, holesky } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = createConfig({
  chains: [mainnet, sepolia, holesky],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [holesky.id]: http()
  }
})

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            "appearance": {
              "accentColor": "#44d29b",
              "theme": "#FFFFFF",
              "showWalletLoginFirst": false,
              "logo": "https://auth.privy.io/logos/privy-logo.png",
              "walletChainType": "ethereum-only"
            },
            "loginMethods": [
              "email",
              "wallet",
              "google"
            ],
            "fundingMethodConfig": {
              "moonpay": {
                "useSandbox": true
              }
            },
            "embeddedWallets": {
              "createOnLogin": "users-without-wallets",
              "requireUserPasswordOnCreate": false
            },
            "mfa": {
              "noPromptOnMfaRequired": false
            }
          }}
        >
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 