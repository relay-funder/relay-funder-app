'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { EthereumProvider } from '@/lib/web3/types';
declare global {
  interface WindowEventMap {
    dummyChainId: CustomEvent;
  }
}
interface IWeb3ContextChain {
  name?: string;
  blockExplorers?: { default: { url: string } };
}

interface IWeb3Context {
  chainId?: number;
  chain?: IWeb3ContextChain;
  address?: string;
  initialized: boolean;
  requestWallet: () => Promise<{
    address?: `0x${string}`;
    chainId?: number;
    isConnected: () => Promise<boolean>;
    getEthereumProvider: () => EthereumProvider;
  }>;
}
const Web3Context = createContext({
  chainId: undefined,
  chain: undefined,
  address: undefined,
  initialized: false,
  requestWallet: async () => ({
    address: undefined,
    chainId: undefined,
    isConnected: async () => false,
    getEthereumProvider: () => {
      throw new Error('getEthereumProvider not implemented');
    },
  }),
} as IWeb3Context);

const initTime = 500;
export function Web3ContextProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [address, setAddress] = useState<`0x${string}` | undefined>();
  const [chainId, setChainId] = useState(0);
  useEffect(() => {
    // mock that loading web3 components might take time
    const timer = setTimeout(() => {
      setInitialized(true);
      setAddress(
        `0xdefe10ca1${BigInt(Math.floor(Math.random() * 16 ** 10)).toString(16)}`,
      );
    }, initTime);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    // Event handler to update context state
    type DetailType = { chainId: string };

    const handleDummyChainIdChanged = (event: CustomEvent<DetailType>) => {
      const eventChainId = parseInt(event.detail.chainId, 16);
      if (eventChainId !== chainId) {
        console.log('dummyChainId changed', chainId, eventChainId);
        setChainId(eventChainId);
      }
    };

    // Listen for the custom event
    window.addEventListener('dummyChainId', handleDummyChainIdChanged);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('dummyChainId', handleDummyChainIdChanged);
    };
  }, [chainId]);
  const value = useMemo(() => {
    console.log('dummy::context-provider rememo value');
    return {
      chainId,
      chain: {},
      address,
      initialized,
      requestWallet: async () => {
        return {
          chainId,
          address,
          isConnected: async () => {
            return initialized;
          },
          getEthereumProvider: () => {
            throw new Error('Ethereum Provider not available in dummy context');
          },
        } as {
          address?: `0x${string}`;
          chainId?: number;
          isConnected: () => Promise<boolean>;
          getEthereumProvider: () => EthereumProvider;
        };
      },
    };
  }, [initialized, address, chainId]);
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
export const useWeb3Context = () => useContext(Web3Context);
