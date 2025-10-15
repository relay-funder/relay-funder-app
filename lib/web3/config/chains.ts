// 3297-> 4513
import { celo } from 'viem/chains';

export const celoSepolia = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    name: 'Celo Sepolia Ether',
    symbol: 'S-CELO',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://forno.celo-sepolia.celo-testnet.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celoscan',
      url: 'https://celo-sepolia.blockscout.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 81930,
    },
  },
  testnet: true,
} as unknown as typeof celo & { id: number };

export { celo as defaultChain, celo };
