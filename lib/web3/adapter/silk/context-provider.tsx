'use client';
import {
  useState,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { wagmiConfig } from '@/lib/web3';

import { WagmiProvider, createConfig, type CreateConnectorFn } from 'wagmi';

// import {
//   initSilk,
//   SilkEthereumProviderInterface,
// } from '@silk-wallet/silk-wallet-sdk';
import {
  connector as silkConnectorCreator,
  connectorOptions as silkConnectorOptions,
} from './connector';

import { debugWeb3ContextProvider as debug } from '@/lib/debug';
import {
  EthereumProvider,
  initSilk,
  SilkEthereumProviderInterface,
} from '@silk-wallet/silk-wallet-sdk';
import { Config } from 'wagmi';

const silkConnector = silkConnectorCreator(silkConnectorOptions);

declare global {
  interface Window {
    silk?: SilkEthereumProviderInterface;
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
    getEthereumProvider: () => Promise<EthereumProvider>;
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
    getEthereumProvider: async () => {
      throw new Error('wallet not connected');
    },
  }),
  connectors: [] as CreateConnectorFn[],
} as IWeb3Context);

if (typeof window !== 'undefined' && typeof window.silk === 'undefined') {
  //initSilk(silkConnectorOptions);
}
export function getProvider() {
  if (typeof window !== 'undefined' && typeof window.silk !== 'undefined') {
    return window.silk;
  }
  return undefined;
}
let config: Config | null = null;
function getConfig() {
  if (config) {
    return config;
  }
  const silkWagmiConfig = wagmiConfig;
  silkWagmiConfig.connectors = [
    ...(silkWagmiConfig?.connectors ?? []),
    silkConnector,
  ];
  config = createConfig(silkWagmiConfig);
  return config;
}

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  const [chainId, setChainId] = useState<number | undefined>();
  const [address, setAddress] = useState<string | undefined>();

  const [autoConnected, setAutoConnected] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const providerInitializedRef = useRef(false);
  const session = useSession();
  debug && console.log('web3/adapter/silk/context-provider: Initializing');

  const chain = useMemo(() => {
    if (!chainId) {
      return undefined;
    }
    for (const configChain of getConfig().chains) {
      if (configChain.id === chainId) {
        return configChain;
      }
    }
    return undefined;
  }, [chainId]);

  const requestWallet = useCallback(async (): Promise<{
    address: `0x${string}`;
    chainId: number;
    isConnected: () => Promise<boolean>;
    getEthereumProvider: () => Promise<EthereumProvider>;
  }> => {
    const provider = getProvider();
    if (!provider) {
      console.warn(
        'web3/adapter/silk/context-provider: requestWallet called without a provider',
      );
      return {
        address: '0x0',
        chainId: 0,
        isConnected: async () => false,
        getEthereumProvider: async () => {
          throw new Error('Wallet not connected');
        },
      };
    }
    debug &&
      console.log(
        'web3/adapter/silk/context-provider: requestWallet: requesting wallet details',
      );
    const accounts = (await provider.request({
      method: 'eth_requestAccounts',
    })) as `0x${string}`[];
    const chainIdHex = await provider.request({
      method: 'eth_chainId',
    });
    const address = accounts[0];
    const chainId = Number(chainIdHex);
    debug &&
      console.log(
        'web3/adapter/silk/context-provider: requestWallet',
        address,
        chainId,
        accounts,
      );
    return {
      address,
      chainId,
      isConnected: async () => true,
      getEthereumProvider: async () => {
        return window.silk as EthereumProvider;
      },
    };
  }, []);

  const checkWallet = useCallback(async (): Promise<{
    address?: `0x${string}`;
    chainId?: number;
  }> => {
    /**
     * check wallet shall only requestWallet when there is a active
     * next-auth session. otherwise we'll get the signin-dialog over & over
     * on navigation
     */
    if (session?.status !== 'authenticated') {
      console.log(
        'web3/adapter/silk/context-provider: checkWallet called without a session',
      );
      return {};
    }
    return requestWallet();
  }, [requestWallet, session]);
  const value = useMemo(() => {
    return {
      chainId,
      chain,
      address,
      initialized,
      requestWallet,
    };
  }, [chainId, chain, address, initialized, requestWallet]);

  useEffect(() => {
    /**
     * This triggers the auto-connect of silk
     */
    if (autoConnected) {
      return;
    }

    let timerId: ReturnType<typeof setTimeout> | undefined = undefined;
    async function checkWalletConnection() {
      console.log('check wallet connection');
      const provider = initSilk(silkConnectorOptions);
      if (!provider) {
        timerId = setTimeout(() => checkWalletConnection(), 100);
        return;
      }
      debug && console.log('web3/adapter/silk/context-provider: auto-connect');
      const { address, chainId } = await checkWallet();
      if (
        typeof address === 'string' &&
        address.startsWith('0x') &&
        typeof chainId === 'number'
      ) {
        setAutoConnected(true);

        setAddress(address);
        setChainId(chainId);
      }
    }
    checkWalletConnection();
    return () => {
      clearTimeout(timerId);
    };
  }, [checkWallet, autoConnected]);

  useEffect(() => {
    /**
     * this effect checks if the provider is loaded
     */
    if (providerInitializedRef.current) {
      return;
    }
    let checkTimer: ReturnType<typeof setTimeout> | undefined = undefined;
    const checkProviderInitialized = () => {
      const globalProvider = getProvider();
      if (!globalProvider) {
        checkTimer = setTimeout(checkProviderInitialized, 100);
        return;
      }
      setInitialized(true);
      providerInitializedRef.current = true;
    };
    checkProviderInitialized();
    return () => {
      if (checkTimer) {
        clearTimeout(checkTimer);
      }
    };
  }, []);
  return (
    <WagmiProvider config={getConfig()} reconnectOnMount={true}>
      <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
    </WagmiProvider>
  );
}
export const useWeb3Context = () => useContext(Web3Context);
