import { useWeb3Context } from './context-provider';
import { wagmiConfig } from './config';
import type { Chain, Client, Transport } from 'viem';
import type { Connector } from 'wagmi';
import { useMemo, useState } from 'react';
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
const contractTime = 3000;

export function useConnectorClient() {
  return { data: {} as unknown as Client<Transport, Chain> };
}
export function useWriteContract() {
  const [data, setData] = useState('');
  return {
    data,
    isPending: false,
    isSuccess: data.startsWith('0xdummy-write-contract-async-hash-done'),
    isError: false,
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
      setData(
        `0xdummy-write-contract-async-hash-pending${Math.round(Math.random() * 1000000000).toString(16)}`,
      );
      setTimeout(() => {
        setData(
          `0xdummy-write-contract-async-hash-done${Math.round(Math.random() * 1000000000).toString(16)}`,
        );
      }, contractTime);
    },
    writeContractAsync: async (params: unknown) => {
      console.log('dummy::wagmi:useWriteContractAsync', params);
      setData(
        `0xdummy-write-contract-async-hash-pending${Math.round(Math.random() * 1000000000).toString(16)}`,
      );
      await new Promise((resolve) => setTimeout(resolve, contractTime));
      setData(
        `0xdummy-write-contract-async-hash-done${Math.round(Math.random() * 1000000000).toString(16)}`,
      );
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
  const isPending = hash?.startsWith(
    '0xdummy-write-contract-async-hash-pending',
  );
  const data = useMemo(() => {
    return {
      logs: [
        {
          address:
            `0xdeb${Math.round(Math.random() * 1000000000).toString(16)}` as `0x${string}`,
          blockHash: '0x00' as `0x${string}`,
          blockNumber: 1n,
          data: '0x00' as `0x${string}`,
          logIndex: 0,
          transactionHash: hash as `0x${string}`,
          transactionIndex: 0,
          removed: false,
          topics: [] as [] | [`0x${string}`, ...`0x${string}`[]],
        },
      ],
      contractAddress: '0x00',
      status: isPending ? 'dummy' : 'success',
      transactionHash: '0x00',
    };
  }, [isPending, hash]);
  console.log('dummy wagmi::useWaitForTransactionReceipt', { hash, query });
  return {
    data,
    isSuccess: isPending === false,
    isLoading: isPending,
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
    connectors: [] as Connector[],
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
  return [] as Chain[];
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
  return [] as { id: string; name: string }[];
}
export function useBalance({
  address,
  token,
}: {
  address?: `0x${string}` | string;
  token?: `0x${string}`;
}) {
  console.log('dummy::wagmi::useBalance', { address, token });
  return {
    data: {
      formatted: `1234.5678`,
      symbol: 'DMMY',
      decimals: 4,
      value: 12345678n,
    },
    isPending: false,
  };
}
export class ConnectorAlreadyConnectedError extends Error {}
