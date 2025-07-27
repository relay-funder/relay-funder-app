'use client';
import { IWeb3UseAuthHook, EthereumProvider } from '@/lib/web3/types';
import { useEffect, useState, useCallback } from 'react';
/**
 * This is a very basic adapter
 * It may be used to access everything a anon web2-user can read
 * but will fail as soon as components are loaded that rely on viem/wagmi/ethers
 */

export { Web3ContextProvider, useWeb3Context } from './context-provider';
import { useWeb3Context } from './context-provider';
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';

const staticAuth = {
  ready: true,
  logout: async () => {
    nextAuthSignOut({ redirect: false });
  },
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

export function useWeb3Auth(): IWeb3UseAuthHook {
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [wallet, setWallet] = useState<{
    getEthereumProvider: () => Promise<EthereumProvider>;
    isConnected: () => Promise<boolean>;
    address: `0x${string}`;
    chainId: number;
  }>();
  const { initialized, address, chainId, requestWallet } = useWeb3Context();
  useEffect(() => {
    requestWallet().then((wallet) =>
      setWallet({
        ...wallet,
        getEthereumProvider: async () => getProvider() as EthereumProvider,
        isConnected: async () => true,
        address:
          (address as `0x${string}`) ??
          `0x${BigInt(Math.floor(Math.random() * 16 ** 10)).toString(16)}`,
        chainId: chainId ?? 0,
      }),
    );
  }, [requestWallet, address, chainId]);
  const login = useCallback(async () => {
    setAuthenticating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (
      confirm('dummy context only, login with randomized address: ' + address)
    ) {
      await nextAuthSignIn('siwe', {
        redirect: false,
        message: address,
        signature: address,
      });
    } else {
      throw new Error('Canceled');
    }
    setAuthenticating(false);
  }, [address, setAuthenticating]);
  return {
    ...staticAuth,
    login,
    ready: initialized,
    authenticating,
    connecting: authenticating,
    address,
    wallet,
  };
}

export * from './ethers';
export * from './config';
export * from './wagmi';
export * from './viem';
