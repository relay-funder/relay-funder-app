'use client';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { WagmiProvider, type Config } from 'wagmi';

import { debugWeb3ContextProvider as debug } from '@/lib/debug';
import { config, createModal } from './config';
import { type AppKit } from '@reown/appkit';
interface IWeb3Context {}
const Web3Context = createContext({} as IWeb3Context);

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  debug && console.log('web3/adapter/appkit/context-provider: Initializing');
  const modalRef = useRef<AppKit | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const value = useMemo(() => ({}), []);
  useEffect(() => {
    if (modalRef.current) {
      return;
    }
    modalRef.current = createModal();
    modalRef.current.ready().then(() => {
      setReady(true);
    });
  }, []);
  if (!ready) {
    return null;
  }
  return (
    <WagmiProvider config={config}>
      <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
    </WagmiProvider>
  );
}
export const useWeb3Context = () => useContext(Web3Context);
