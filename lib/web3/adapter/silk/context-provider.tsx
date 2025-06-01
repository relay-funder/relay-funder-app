import { type ReactNode } from 'react';

import { config as wagmiConfig } from '@/lib/web3/config/wagmi';
import { WagmiProvider } from 'wagmi';

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
