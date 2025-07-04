import type { Chain } from '@/lib/web3/types';

const mockEthereum = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://eth.merkle.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
      apiUrl: 'https://api.etherscan.io/api',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67',
      blockCreated: 19_258_213,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
};
const mockAlfajores = {
  id: 44787,
  name: 'Alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'A-CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Alfajores Explorer',
      url: 'https://celo-alfajores.blockscout.com',
      apiUrl: 'https://celo-alfajores.blockscout.com/api',
    },
  },
};
export const wagmiConfig = {
  chains: [mockEthereum, mockAlfajores] as Chain[],
  connectors: [],
  transports: {},
  ssr: true,
};

const defaultChain = mockAlfajores;
export const chainConfig = {
  chainId: defaultChain.id,
  name: defaultChain.name,
  nativeCurrency: defaultChain.nativeCurrency,
  rpcUrl: defaultChain.rpcUrls.default.http[0],
  blockExplorerUrl: defaultChain.blockExplorers.default.url,
  defaultChain,
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
