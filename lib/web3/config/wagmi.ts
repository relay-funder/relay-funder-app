import { http, type Config, type CreateConfigParameters } from 'wagmi';
import { chainConfig } from '@/lib/web3/config/chain';
import { sepolia, defaultChain, celo, mainnet } from './chains';
import { injected } from './connectors';

// Add type declaration for wagmi config
declare module 'wagmi' {
  interface Register {
    config: Config;
  }
}

export const config: CreateConfigParameters = {
  chains: [defaultChain, sepolia, celo, mainnet],
  connectors: [injected()],
  transports: {
    [defaultChain.id]: http(chainConfig.rpcUrl),
    [sepolia.id]: http(),
    [celo.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
};
