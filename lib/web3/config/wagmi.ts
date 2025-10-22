import {
  createConfig,
  http,
  type Config,
} from 'wagmi';
import { chainConfig } from './chain';
import { defaultChain, celo, daimoPayChains } from './chains';

// Add type declaration for wagmi config
declare module 'wagmi' {
  interface Register {
    config: Config;
  }
}

// Build base chains (include celo only when needed)
const baseChains = [defaultChain];
if (defaultChain.id !== celo.id) {
  baseChains.push(celo);
}

// Combine with Daimo Pay chains and dedupe by chain.id
const allChains = [...baseChains, ...daimoPayChains];
const dedupedChains = allChains.filter(
  (chain, index, self) => self.findIndex((c) => c.id === chain.id) === index,
) as [(typeof allChains)[0], ...typeof allChains]; // Ensure at least one chain

// Create transports mapping each chain.id to http() transport
// Use custom RPC url for defaultChain, standard http() for others
const transports: Record<number, ReturnType<typeof http>> = {};
dedupedChains.forEach((chain) => {
  transports[chain.id] =
    chain.id === defaultChain.id ? http(chainConfig.rpcUrl) : http();
});

export const config: Config = createConfig({
  chains: dedupedChains,
  transports,
  ssr: true,
});
