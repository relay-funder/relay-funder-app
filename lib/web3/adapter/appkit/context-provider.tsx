'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { WagmiProvider, type Config } from 'wagmi';

import { debugWeb3ContextProvider as debug } from '@/lib/debug';
import { config } from './config';
interface IWeb3Context {}
const Web3Context = createContext({} as IWeb3Context);

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  debug && console.log('web3/adapter/appkit/context-provider: Initializing');

  const value = useMemo(() => ({}), []);

  return (
    <WagmiProvider config={config as Config}>
      <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
    </WagmiProvider>
  );
}
export const useWeb3Context = () => useContext(Web3Context);
