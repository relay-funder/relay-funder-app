import { http, createConfig } from 'wagmi'
import { sepolia, celoAlfajores, celo } from 'wagmi/chains'

export const config = createConfig({
  chains: [celoAlfajores, sepolia, celo], // adjust chains as needed
  transports: {
    [celoAlfajores.id]: http(),
    [sepolia.id]: http(),
    [celo.id]: http(),
  },
}) 