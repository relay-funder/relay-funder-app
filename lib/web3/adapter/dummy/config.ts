import type { Chain } from '@/lib/web3/types';

export const wagmiConfig = {
  chains: [] as Chain[],
  connectors: [],
  transports: {},
  ssr: true,
};

export const chainConfig = {
  chainId: 0,
  name: 'dummy',
  nativeCurrency: { decimals: 2, name: 'DMMY', symbol: 'DMMY' },
  rpcUrl: 'http://localhost:1414/rpc',
  blockExplorerUrl: 'http://localhost:1414/explorer',
  defaultChain: {
    id: 0,
    name: 'dummy',
    nativeCurrency: { decimals: 2, name: 'DMMY', symbol: 'DMMY' },
    rpcUrls: {
      default: {
        http: ['http://localhost:1414/rpc'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Dummy Explorer',
        url: 'http://localhost:1414/explorer',
        apiUrl: 'http://localhost:1414/explorer/api',
      },
    },
  },
  getAddChainParams() {
    return {
      chainId: this.chainId,
      chainName: this.name,
      nativeCurrency: this.nativeCurrency,
      rpcUrls: [this.rpcUrl],
      blockExplorerUrls: [this.blockExplorerUrl],
    };
  },
};
