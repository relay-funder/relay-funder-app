'use client';
import { IWeb3UseAuthHook } from '@/lib/web3/types';
import { useEffect, useState } from 'react';
/**
 * This is a very basic adapter
 * It may be used to access everything a anon web2-user can read
 * but will fail as soon as components are loaded that rely on viem/wagmi/ethers
 */

export { Web3ContextProvider, useWeb3Context } from './context-provider';
import { useWeb3Context } from './context-provider';
const staticAuth = {
  address: '0x0',
  authenticated: true,
  ready: true,
  login: async () => {
    alert('dummy context only, switch in /lib/web3/adapter');
  },
  logout: async () => {},
};
export function getProvider() {
  return {
    request: async ({
      method,
      params,
    }: {
      method: string;
      params: unknown[];
    }) => {
      console.log('provider.request', { method, params });
      if (method === 'wallet_switchEthereumChain') {
        window.dispatchEvent(
          new CustomEvent('dummyChainId', {
            detail: params[0],
          }),
        );
      }
    },
    on: (event: string, callback: unknown) =>
      console.log('provider.on', event, callback),
    removeListener: (event: string, callback: unknown) =>
      console.log('provider.removeListener', event, callback),
  };
}

export function useAuth(): IWeb3UseAuthHook {
  const [wallet, setWallet] = useState();
  const { initialized, address, requestWallet } = useWeb3Context();
  useEffect(() => {
    requestWallet().then((wallet) =>
      setWallet({ ...wallet, getEthereumProvider: getProvider }),
    );
  }, [requestWallet]);
  return {
    ...staticAuth,
    ready: initialized,
    address,
    wallet,
  };
}

export * from './ethers';
export * from './config';
export * from './wagmi';
export * from './viem';
