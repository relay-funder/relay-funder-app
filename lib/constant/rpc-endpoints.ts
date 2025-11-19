import { IS_PRODUCTION } from '../utils/env';

const CELO_MAINNET_FALLBACKS = [
  'https://rpc.ankr.com/celo',
  'https://celo.api.onfinality.io/public',
] as const;

const CELO_SEPOLIA_FALLBACKS = [
  'https://rpc.ankr.com/celo_sepolia',
  'https://celo-sepolia.api.onfinality.io/public',
] as const;

export const CELO_RPC_ENDPOINTS = {
  primary: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
  fallbacks: IS_PRODUCTION ? CELO_MAINNET_FALLBACKS : CELO_SEPOLIA_FALLBACKS,
} as const;
