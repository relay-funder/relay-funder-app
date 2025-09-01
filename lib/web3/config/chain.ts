/**
 * Global chain configuration for the application.
 * This centralizes all chain-related constants used across components.
 */

import { defaultChain } from './chains';

export const chainConfig = {
  // Chain identifiers
  chainId: defaultChain.id,

  // Chain details derived from wagmi
  name: defaultChain.name,
  nativeCurrency: defaultChain.nativeCurrency,

  // Custom values not from wagmi
  rpcUrl:
    process.env.NEXT_PUBLIC_RPC_URL || defaultChain.rpcUrls.default.http[0],
  blockExplorerUrl:
    defaultChain.blockExplorers?.default?.url ||
    'https://alfajores.celoscan.io/',

  // Reference to the actual chain object for provider configurations
  defaultChain,

  // Helper methods
  getAddChainParams() {
    return {
      chainId: `0x${this.chainId.toString(16)}`,
      chainName: this.name,
      nativeCurrency: this.nativeCurrency,
      rpcUrls: [this.rpcUrl],
      blockExplorerUrls: [this.blockExplorerUrl],
    };
  },
};

export default chainConfig;
