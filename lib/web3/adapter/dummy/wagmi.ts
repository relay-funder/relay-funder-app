import { useWeb3Context } from './context-provider';
import { wagmiConfig } from './config';
// wagmi/core  1837->2522 + 500ms
// export { readContract, createConfig } from '@wagmi/core';
export async function readContract(config: unknown, contract: unknown) {
  console.log('dummy wagmi-core::readContract', { config, contract });
  return 0;
}
export function createConfig(config: unknown) {
  console.log('dummy wagmi-core::readContract', { config });
  return config;
}
// wagmi 1837->3093, +800ms
// export {
//   useConnectorClient,
//   useWriteContract,
//   useWaitForTransactionReceipt,
//   useDeployContract,
//   useConfig,
//   useChainId,
// } from 'wagmi';

export function useConnectorClient() {
  return { data: { chain: {} } };
}
export function useWriteContract() {
  return {
    data: '',
    isPending: false,
    error: null as Error | null,
    reset: () => {},
    writeContract: (
      params: unknown,
      callbacks?: {
        onSuccess: (hash: `0x${string}` | null) => void;
        onError: (error?: Error) => void;
      },
    ) => {
      console.log('dummy::wagmi:useWriteContract', params, callbacks);
    },
  };
}
export function useWaitForTransactionReceipt({
  hash,
  query,
}: {
  hash?: string | `0x${string}`;
  query?: unknown;
}) {
  console.log('dummy wagmi::useWaitForTransactionReceipt', { hash, query });
  return {
    data: {
      logs: [{ address: '0x00' }],
      contractAddress: '0x00',
      status: 'dummy',
      transactionHash: '0x00',
    },
    isSuccess: false,
    isLoading: false,
    isError: false,
    error: null as Error | null,
  };
}
export function useDeployContract() {
  return {
    deployContract: (
      params: unknown,
      callbacks?: {
        onSuccess: (hash: `0x${string}`) => void;
        onError: (error: Error) => void;
      },
    ) => {
      console.log('dummy:wagmi:useDeployContract', { params, callbacks });
    },
    error: null as Error | null,
    reset: () => {},
  };
}
export function useConfig() {
  return wagmiConfig;
}
export function useAccount() {
  const { chainId, address } = useWeb3Context();

  console.log('dummy:wagmi:useAccount');
  return {
    address,
    chainId,
    isConnected: true,
    status: 'connected',
  };
}
export function useDisconnect() {
  console.log('dummy:wagmi:useConnect');
  return {
    disconnectAsync: async () => {},
  };
}
export function useConnect() {
  console.log('dummy:wagmi:useConnect');
  return {
    connectors: [],
    connect: (
      { connector }: { connector: unknown },
      {
        onSuccess,
        onError,
      }: { onSuccess?: () => void; onError?: (error: Error) => void },
    ) => {
      console.log('dummy:wagmi:useConnect:connect', {
        connector,
        onSuccess,
        onError,
      });
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    },
  };
}

export function useChainId() {
  const { chainId } = useWeb3Context();

  return chainId;
}
export function useChains() {
  return [];
}
export function useSwitchChain() {
  return {
    switchChainAsync: async (arg0: { chainId: number }) =>
      console.log('dummy::useSwitchChain::switchChainAsync', arg0),
  };
}
export function useSignMessage() {
  return {
    signMessageAsync: async (arg0: unknown) => {
      console.warn('useConnect::signMessageAsync', arg0);
      return 'mock-signed-message';
    },
  };
}
export function useConnectors() {
  return [];
}
export function useBalance({
  address,
  token,
}: {
  address: `0x${string}`;
  token?: `0x${string}`;
}) {
  console.log('dummy::wagmi::useBalance', { address, token });
  return {
    data: { formatted: `1234.5678`, symbol: 'DMMY' },
    isPending: false,
  };
}
export class ConnectorAlreadyConnectedError extends Error {}
