'use client';

import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useState, useCallback, useMemo, useRef } from 'react';
import {
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitState,
} from '@reown/appkit/react';

import { UserRejectedRequestError } from 'viem';
import {
  useAccount,
  useConnect,
  useReconnect,
  useDisconnect,
  useConnectorClient,
} from 'wagmi';
import { ConnectorAlreadyConnectedError } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';

import { chainConfig } from '@/lib/web3';

import { useToast } from '@/hooks/use-toast';
import type { IWeb3UseAuthHook } from '@/lib/web3/types';
import { debugWeb3UseAuth as debug } from '@/lib/debug';

/**
 * Handles wagmi connect, signMessage, and logout using the appkit wallet.
 * @returns
 */
export function useWeb3Auth(): IWeb3UseAuthHook {
  const [state, setState] = useState<{
    loading?: boolean;
    authenticating?: boolean;
    connecting?: boolean;
    error?: Error;
  }>({});
  const { toast } = useToast();

  const { connectors } = useConnect();

  const { address, isConnected: isWagmiConnected } = useAccount();
  const { open } = useAppKit();
  const { disconnectAsync: wagmiDisconnect } = useDisconnect();
  const { data: client } = useConnectorClient();
  const { loading } = useAppKitState();
  const { isConnected: isAccountConnected } = useAppKitAccount();
  const loginRef = useRef(false);

  const normalizedAddress = useMemo(() => {
    debug &&
      console.log(
        'web3/adapter/appkit/use-auth:rememo normalizedAddress',
        address,
      );
    if (typeof address === 'string' && address.startsWith('0x')) {
      return address.toLowerCase();
    }
    return undefined;
  }, [address]);
  const isConnected = useCallback(async () => {
    return isWagmiConnected;
  }, [isWagmiConnected]);

  const wallet = useMemo(() => {
    return { address: normalizedAddress, isConnected };
  }, [normalizedAddress, isConnected]);

  const logout = useCallback(async () => {
    debug && console.log('web3/adapter/appkit/use-auth:logout');
    await nextAuthSignOut();
    await wagmiDisconnect();

    setState({});
  }, [wagmiDisconnect]);

  const params = useSearchParams();
  const callbackUrl = useMemo(() => {
    const paramCallbackUrl = params?.get('callbackUrl');
    console.log('rememo callback url', { paramCallbackUrl });
    if (
      typeof window === 'undefined' ||
      typeof paramCallbackUrl !== 'string' ||
      paramCallbackUrl.startsWith('/')
    ) {
      console.log(
        'use-web3-auth::callbackUrl:: no window, no callbackUrl or callbackUrl starts with /',
        paramCallbackUrl,
      );
      return '/dashboard';
    }
    // Prevent cross-domain callbacks on deployment domains
    // Check if current domain matches patterns where external callbacks should be blocked
    try {
      const callbackDomain = new URL(paramCallbackUrl).hostname;
      const currentDomain = window.location.hostname;

      // Get domain patterns from environment variable
      const blockPatterns =
        process.env.NEXT_PUBLIC_BLOCK_EXTERNAL_CALLBACK_DOMAINS?.split(',').map(
          (p) => p.trim(),
        ) || [];

      if (currentDomain !== callbackDomain) {
        const shouldBlock = blockPatterns.some((pattern) => {
          // Support wildcards and exact matches
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(currentDomain);
          }
          return currentDomain.includes(pattern);
        });

        if (shouldBlock) {
          console.warn(
            `Cross-domain callback prevented: ${currentDomain} → ${callbackDomain} (matched pattern)`,
          );
          return '/dashboard';
        }
      }
    } catch (error) {
      // Invalid URL, use dashboard
      console.error('invalid url', error);
      return '/dashboard';
    }

    return paramCallbackUrl;
  }, [params]);

  const login = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      authenticating: false,
      connecting: true,
      error: undefined,
    }));
    loginRef.current = true;
    debug && console.log('web3/adapter/appkit/use-auth:login', { connectors });
    const defaultChain = chainConfig.defaultChain;
    try {
      debug &&
        console.log(
          'web3/adapter/appkit/use-auth:login: request wagmi(appkit) to login -> connector::connect',
          defaultChain,
        );
      const connectResult = await open({
        view: 'Connect',
      });
      debug &&
        console.log(
          'web3/adapter/appkit/use-auth:login: connect to wallet complete continue with login to next-auth',
          connectResult,
        );
      // decouple connect from signin to backend (wait for wagmi to pick up the connection)
    } catch (error) {
      if (error instanceof ConnectorAlreadyConnectedError) {
        debug &&
          console.log(
            'web3/adapter/appkit/use-auth:login: already connected, retrying',
          );
        await wagmiDisconnect();
        return await login();
      }
      console.error(
        'web3/adapter/appkit/use-auth:login: error connecting to appkit',
        error,
      );
      if (error instanceof UserRejectedRequestError) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Operation cancelled by user',
        });
      }
      setState((prevState) => ({
        ...prevState,
        authenticating: false,
        connecting: false,
        error: error as Error,
      }));
      loginRef.current = false;
      throw error;
    }
  }, [toast, connectors, wagmiDisconnect, open]);

  const ready = useMemo(() => {
    debug &&
      console.log(
        'web3/adapter/appkit/use-auth:rememo ready',
        address,
        typeof client,
        loading,
        isWagmiConnected,
      );
    if (isWagmiConnected) {
      return true;
    }
    if (isAccountConnected) {
      return true;
    }
    return false;
  }, [address, loading, isWagmiConnected, isAccountConnected, client]);

  debug &&
    console.log('web3/adapter/appkit/use-auth:render', {
      ready,
      normalizedAddress,
      loading,
      isWagmiConnected,
      isAccountConnected,
    });
  return {
    address: normalizedAddress,
    wallet,
    authenticating: state.authenticating ?? false,
    connecting: state.connecting ?? false,
    error: state.error,
    login,
    logout,
    ready,
  };
}
