import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia], // adjust chains as needed
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}) 