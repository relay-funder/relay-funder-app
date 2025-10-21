import { http, type Config, type CreateConfigParameters } from 'wagmi';
import { chainConfig } from './chain';
import { defaultChain, celo, daimoPayChains } from './chains';

// Add type declaration for wagmi config
declare module 'wagmi' {
  interface Register {
    config: Config;
  }
}

export const config: CreateConfigParameters = {
  chains: [defaultChain],
  transports: {
    [defaultChain.id]: http(chainConfig.rpcUrl),
  },
  ssr: true,
};
// once we switch to celo, avoid errors
if (defaultChain.id !== celo.id) {
  (config.chains as unknown as unknown[]).push(celo);
  config.transports[celo.id] = http(chainConfig.rpcUrl);
}

// Add Daimo Pay required chains to existing config
daimoPayChains.forEach((chain) => {
  if (!config.chains.some((existingChain) => existingChain.id === chain.id)) {
    (config.chains as unknown as unknown[]).push(chain);
    config.transports[chain.id] = http();
  }
});
