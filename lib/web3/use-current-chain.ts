import { useChainId, useConfig } from '@/lib/web3';
import { useMemo } from 'react';

/**
 * Hook to get the current chain object from the wagmi config based on the current chain ID.
 * @returns The current chain object from the wagmi config, or undefined if no chainId is active.
 */
export function useCurrentChain() {
  const config = useConfig();
  const chainId = useChainId();
  const currentChain = useMemo(() => {
    if (!chainId) {
      return undefined;
    }
    return config.chains.find((chain) => chain.id === chainId);
  }, [chainId, config]);
  return { chain: currentChain, chainId };
}
