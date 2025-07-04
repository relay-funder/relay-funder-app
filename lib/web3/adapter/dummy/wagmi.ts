import { useWeb3Context } from './context-provider';
import { wagmiConfig, chainConfig } from './config';
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
export function useChainId() {
  const { chainId } = useWeb3Context();

  return chainId;
}
