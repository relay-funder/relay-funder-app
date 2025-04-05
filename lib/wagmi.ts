// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { celoAlfajores, mainnet, sepolia } from 'wagmi/chains'

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}

export const config = createConfig({
    chains: [celoAlfajores, sepolia, mainnet],
    transports: {
        [celoAlfajores.id]: http(),
        [sepolia.id]: http(),
        [mainnet.id]: http(),
    },
})

export const chains = [celoAlfajores, sepolia, mainnet]
