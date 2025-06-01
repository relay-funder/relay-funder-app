import { http, createConfig, type Config } from 'wagmi';
import { sepolia, celoAlfajores, celo, mainnet } from 'wagmi/chains';

import { chainConfig } from '@/lib/web3/config/chain';

// Export chains for use in other files
export { sepolia, celoAlfajores, celo, mainnet };
import { injected } from 'wagmi/connectors';
import { silk } from '@/lib/web3/adapter/silk/connector';

// Add type declaration for wagmi config
declare module 'wagmi' {
  interface Register {
    config: Config;
  }
}

export const config = createConfig({
  chains: [celoAlfajores, sepolia, celo, mainnet],
  connectors: [silk(), injected()],
  transports: {
    [celoAlfajores.id]: http(chainConfig.rpcUrl),
    [sepolia.id]: http(),
    [celo.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
}) as Config;
