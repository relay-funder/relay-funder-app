import {
  useState,
  useCallback,
  createContext,
  useContext,
  useMemo,
  useEffect,
  type ReactNode,
  Suspense,
} from 'react';
import { useSession } from 'next-auth/react';
import { config as wagmiConfig } from '@/lib/web3/config/wagmi';
import {
  WagmiProvider,
  createConfig,
  CreateConnectorFn,
  CreateConfigParameters,
} from 'wagmi';
import {
  initSilk,
  SilkEthereumProviderInterface,
  EthereumProvider,
} from '@silk-wallet/silk-wallet-sdk';
import {
  connector as silkConnectorCreator,
  connectorOptions as silkConnectorOptions,
} from './connector';

import { debugWeb3ContextProvider as debug } from '@/lib/debug';

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
  provider?: EthereumProvider;
  requestWallet: () => Promise<{ address?: `0x${string}`; chainId?: number }>;
  addConnector: (arg0: CreateConnectorFn) => void;
}
const Web3Context = createContext({
  chainId: undefined,
  chain: undefined,
  address: undefined,
  provider: undefined,
  requestWallet: async () => ({ address: undefined, chainId: undefined }),
  addConnector: ({}) => undefined,
} as IWeb3Context);

if (typeof window !== 'undefined' && typeof window.silk === 'undefined') {
  initSilk(silkConnectorOptions);
}

export function Web3ContextProvider({ children }: { children: ReactNode }) {
  const [connectors, setConnectors] = useState<readonly CreateConnectorFn[]>(
    wagmiConfig.connectors ?? [],
  );

  const [provider, setProvider] = useState<EthereumProvider | undefined>();
  const [autoConnected, setAutoConnected] = useState(false);
  const session = useSession();
  debug &&
    console.log('web3/adapter/silk-wagmi/context-provider: Initializing');

  const config = useMemo(
    () =>
      createConfig({
        chains: wagmiConfig.chains,
        connectors,
        transports: wagmiConfig.transports,
        ssr: wagmiConfig.ssr,
      } as CreateConfigParameters),
    [connectors],
  );

  const addConnector = useCallback(
    (newConnector: CreateConnectorFn) => {
      debug &&
        console.log('web3/adapter/silk-wagmi/context-provider: addConnector');
      setConnectors((prevState) => {
        if (prevState.includes(newConnector)) {
          return prevState;
        }
        return [...prevState, newConnector] as readonly CreateConnectorFn[];
      });
    },
    [setConnectors],
  );

  const requestWallet = useCallback(async (): Promise<{
    address?: `0x${string}`;
    chainId?: number;
  }> => {
    let walletProvider = provider;
    if (walletProvider !== window.silk) {
      walletProvider = window.silk as unknown as EthereumProvider;
    }
    if (!walletProvider) {
      console.warn(
        'web3/adapter/silk-wagmi/context-provider: requestWallet called without a provider',
      );
      return {};
    }
    debug &&
      console.log(
        'web3/adapter/silk-wagmi/context-provider: requestWallet: requesting wallet details',
      );
    const accounts = (await walletProvider.request({
      method: 'eth_requestAccounts',
    })) as `0x${string}`[];
    const chainIdHex = await walletProvider.request({
      method: 'eth_chainId',
    });
    const address = accounts[0];
    const chainId = Number(chainIdHex);
    debug &&
      console.log(
        'web3/adapter/silk-wagmi/context-provider: requestWallet',
        address,
        chainId,
        accounts,
      );
    return { address, chainId };
  }, [provider]);

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
        'web3/adapter/silk-wagmi/context-provider: checkWallet called without a session',
      );
      return {};
    }
    return requestWallet();
  }, [requestWallet, session]);
  const value = useMemo(() => {
    return {
      requestWallet,
      provider,
      addConnector,
    };
  }, [requestWallet, provider, addConnector]);

  useEffect(() => {
    /**
     * This triggers the auto-connect of silk
     */
    if (autoConnected) {
      return;
    }
    let timerId: ReturnType<typeof setTimeout> | undefined = undefined;
    async function checkWalletConnection() {
      if (!provider) {
        timerId = setTimeout(() => checkWalletConnection(), 100);
        return;
      }
      debug &&
        console.log('web3/adapter/silk-wagmi/context-provider: auto-connect');
      const { address, chainId } = await checkWallet();
      if (
        typeof address === 'string' &&
        address.startsWith('0x') &&
        typeof chainId === 'number'
      ) {
        setAutoConnected(true);
      }
    }
    checkWalletConnection();
    return () => {
      clearTimeout(timerId);
    };
  }, [provider, checkWallet, autoConnected]);
  useEffect(() => {
    /**
     * this effect ensures that the mutating window.silk is always
     * set to the provider instance.
     * beware: await login mutates, so you should not use provider
     *         afterwards. use window.silk directly or dispatch a
     *         memo/event
     */
    let timerId: ReturnType<typeof setTimeout> | undefined = undefined;
    function checkProvider() {
      if (provider !== window.silk) {
        setProvider(window.silk as EthereumProvider);
        console.warn(
          'web3/adapter/silk-wagmi/context-provider: window.silk changed',
        );
      }
      timerId = setTimeout(() => checkProvider(), 100);
    }
    checkProvider();
    return () => {
      clearTimeout(timerId);
    };
  }, [provider]);

  useEffect(() => {
    /**
     * this effect adds the silk connector to the wagmi-connectors
     * only in the client-code
     */
    const loadedSilkConnector = connectors.find(
      (connector) => connector === silkConnector,
    );
    if (!loadedSilkConnector) {
      debug &&
        console.log(
          'web3/adapter/silk-wagmi/context-provider: Adding silk connector',
          silkConnector,
        );
      addConnector(silkConnector);
    }
  }, [connectors, addConnector]);

  return (
    <WagmiProvider config={config}>
      <Suspense>
        <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
      </Suspense>
    </WagmiProvider>
  );
}
export const useWeb3Context = () => useContext(Web3Context);
