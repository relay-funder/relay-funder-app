import { type ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { providerClientConfig as privyProviderClientConfig } from '@/lib/web3/auth/privy/client-config';
import { config as privyWagmiConfig } from '@/lib/web3/auth/privy/config';

import { config as wagmiConfig } from '@/lib/web3/config/wagmi';
import { WagmiProvider } from 'wagmi';
import { AUTH_PROVIDER, PRIVY_APP_ID } from '@/lib/constant';

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  if (AUTH_PROVIDER === 'privy') {
    return <Web3ContextProviderPrivy>{children}</Web3ContextProviderPrivy>;
  }
  if (AUTH_PROVIDER === 'silk') {
    return <Web3ContextProviderSilk>{children}</Web3ContextProviderSilk>;
  }
  console.warn('[DEV] invalid AUTH_PROVIDER - all web3 components will fail');
  return children;
}

export function Web3ContextProviderPrivy({
  children,
}: {
  children: ReactNode;
}) {
  if (!PRIVY_APP_ID.length) {
    console.warn('[DEV]: missing PRIVY_APP_ID');
  }
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyProviderClientConfig}>
      <PrivyWagmiProvider config={privyWagmiConfig}>
        {children}
      </PrivyWagmiProvider>
    </PrivyProvider>
  );
}
export function Web3ContextProviderSilk({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
