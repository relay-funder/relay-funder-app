/**
 * Global chain configuration for the application.
 * This centralizes all chain-related constants used across components.
 */

import { defaultChain } from './chains';

const CELO_PARAMS = {
  chainId: '0xa4ec',
  chainName: 'Celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
  rpcUrls: ['https://forno.celo.org'],
  blockExplorerUrls: ['https://celo.blockscout.com/'],
  iconUrls: ['future'],
};

const CELO_SEPOLIA_PARAMS = {
  chainId: '0xAA044C',
  chainName: 'Celo Sepolia',
  nativeCurrency: { name: 'Celo', symbol: 'S-CELO', decimals: 18 },
  rpcUrls: ['https://forno.celo-sepolia.celo-testnet.org/'],
  blockExplorerUrls: ['https://celo-sepolia.blockscout.com/'],
  iconUrls: ['future'],
};
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
    'https://celo-sepolia.blockscout.com',

  // Reference to the actual chain object for provider configurations
  defaultChain,

  // Helper methods
  getAddChainParams() {
    if ((this.chainId as number) === 11142220) {
      return CELO_SEPOLIA_PARAMS;
    }
    return CELO_PARAMS;
  },
};

export default chainConfig;
