// lib/wagmi.ts
import { http } from 'wagmi'
import { celoAlfajores, mainnet, sepolia } from 'wagmi/chains'
import { createConfig } from '@privy-io/wagmi'

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

if (!privyAppId) {
    console.warn("Wagmi Config Warning: NEXT_PUBLIC_PRIVY_APP_ID is not set. Privy connector might not function correctly.");
}

export const config = createConfig({
    chains: [celoAlfajores, sepolia, mainnet],
    transports: {
        [celoAlfajores.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://alfajores-forno.celo-testnet.org"),
        [sepolia.id]: http(),
        [mainnet.id]: http(),
    },
    ssr: true,
})

console.log("Wagmi Config Created:", {
    chains: config.chains.map(c => `${c.name} (${c.id})`),
    privyAppIdUsed: privyAppId || "NOT SET",
});
