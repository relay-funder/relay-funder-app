import { chainConfig } from '@/lib/web3/config/chain';

export const CELO_RPC_ENDPOINTS = {
  primary: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
  fallbacks:
    chainConfig.chainId === 42220
      ? [
          // Mainnet public endpoints
          'https://rpc.ankr.com/celo',
          'https://celo.api.onfinality.io/public',
        ]
      : [
          // Sepolia testnet public endpoints
          'https://rpc.ankr.com/celo_sepolia',
          'https://celo-sepolia.api.onfinality.io/public',
        ],
} as const;
