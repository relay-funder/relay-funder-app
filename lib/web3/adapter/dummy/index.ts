import { IWeb3UseAuthHook } from '@/lib/web3/types';

/**
 * This is a very basic adapter
 * It may be used to access everything a anon web2-user can read
 * but will fail as soon as components are loaded that rely on viem/wagmi/ethers
 */

export { Web3ContextProvider, useWeb3Context } from './context-provider';
const staticAuth = {
  address: '0x0',
  authenticated: false,
  ready: true,
  login: async () => {
    alert('dummy context only, switch in /lib/web3/adapter');
  },
  logout: async () => {},
};

export function useAuth(): IWeb3UseAuthHook {
  return staticAuth;
}
export function getProvider() {
  return undefined;
}

export * from './ethers';
export * from './config';
export * from './wagmi';
export * from './viem';
