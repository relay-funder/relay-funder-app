import { http, createConfig, type Config } from 'wagmi';
import { sepolia, celoAlfajores, celo, mainnet } from 'wagmi/chains';

import { chainConfig } from '@/lib/web3/config/chain';

// Export chains for use in other files
export { sepolia, celoAlfajores, celo, mainnet };

// Add type declaration for wagmi config
declare module 'wagmi' {
  interface Register {
    config: Config;
  }
}

export const config = createConfig({
  chains: [celoAlfajores, sepolia, celo, mainnet],
  transports: {
    [celoAlfajores.id]: http(chainConfig.rpcUrl),
    [sepolia.id]: http(),
    [celo.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
}) as Config;
