'use client';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

import { UserRejectedRequestError } from 'viem';
import { useAccount, useConnect, useReconnect, useDisconnect } from 'wagmi';
import { ConnectorAlreadyConnectedError } from 'wagmi';
import { useRouter } from 'next/navigation';

import { chainConfig } from '@/lib/web3';

import { useToast } from '@/hooks/use-toast';
import type { IWeb3UseAuthHook } from '@/lib/web3/types';
import { useWeb3Context, getProvider } from './context-provider';
import { debugWeb3UseAuth as debug } from '@/lib/debug';
import { useSignInToBackend } from '@/lib/web3/hooks/use-signin-to-backend';

/**
 * Handles wagmi connect, signMessage, and logout using the Silk wallet.
 * @returns
 */
export function useWeb3Auth(): IWeb3UseAuthHook {
  const [state, setState] = useState<{
    loading?: boolean;
    authenticating?: boolean;
    error?: Error;
  }>({});
  const { toast } = useToast();
  const router = useRouter();
  const { address: web3ContextAddress, initialized } = useWeb3Context();
  const [connectSuccess, setConnectSuccess] = useState(false);

  const { connectAsync: wagmiConnectAsync, connectors } = useConnect();

  const {
    address,
    isConnected: isWagmiConnected,
    status: wagmiStatus,
  } = useAccount();
  const { reconnect: wagmiReconnect } = useReconnect();
  const { disconnectAsync: wagmiDisconnect } = useDisconnect();

  const reconnectingRef = useRef(false);
  const [reconnectingReadyUpdated, setReconnectingReadyUpdated] = useState(0);
  const loginRef = useRef(false);

  const normalizedAddress = useMemo(() => {
    debug &&
      console.log(
        'web3/adapter/silk/use-auth:rememo normalizedAddress',
        address,
        web3ContextAddress,
      );
    if (typeof address === 'string' && address.startsWith('0x')) {
      return address.toLowerCase();
    }
    if (
      typeof web3ContextAddress === 'string' &&
      web3ContextAddress.startsWith('0x')
    ) {
      return web3ContextAddress.toLowerCase();
    }
    return undefined;
  }, [address, web3ContextAddress]);
  const isConnected = useCallback(async () => {
    return isWagmiConnected;
  }, [isWagmiConnected]);

  const getEthereumProvider = useCallback(async () => {
    return getProvider();
  }, []);

  const wallet = useMemo(() => {
    return { address: normalizedAddress, isConnected, getEthereumProvider };
  }, [normalizedAddress, isConnected, getEthereumProvider]);

  const logout = useCallback(async () => {
    debug && console.log('web3/adapter/silk/use-auth:logout');
    await nextAuthSignOut();
    await wagmiDisconnect();
    const provider = getProvider();

    if (provider) {
      await provider.logout();
    }
    setState({});
  }, [wagmiDisconnect]);

  const signInToBackend = useSignInToBackend();
  const signinAfterConnect = useCallback(async () => {
    try {
      const callbackUrl = await signInToBackend();
      router.push(callbackUrl);
    } catch (error) {
      console.error('Login failed:', error);
      setState((prevState) => ({
        ...prevState,
        authenticating: false,
        error: error as Error,
      }));
    } finally {
      setState((prevState) => ({
        ...prevState,
        authenticating: false,
      }));
      loginRef.current = false;
      setReconnectingReadyUpdated(Date.now());
    }
  }, [router, signInToBackend]);
  useEffect(() => {
    // synchronize the connect(connector) and the actual connected state
    if (connectSuccess && wagmiStatus === 'connected') {
      signinAfterConnect().catch(console.warn);
      setConnectSuccess(false);
    }
  }, [connectSuccess, wagmiStatus, signinAfterConnect]);

  const login = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      authenticating: true,
      error: undefined,
    }));
    loginRef.current = true;
    debug && console.log('web3/adapter/silk/use-auth:login');
    const loadedSilkConnector = connectors.find(
      (connector) => connector.id === 'silk',
    );
    const defaultChain = chainConfig.defaultChain;
    try {
      if (!loadedSilkConnector) {
        throw new Error(
          'web3/adapter/silk/use-auth:login: Configuration issue: silk connector not in wagmi config',
        );
      }
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:login: request wagmi(silk) to login -> connector::connect',
        );
      const connectResult = await wagmiConnectAsync({
        chainId: defaultChain.id,
        connector: loadedSilkConnector,
      });
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:login: connect to wallet complete continue with login to next-auth',
          connectResult,
        );
      // decouple connect from signin to backend (wait for wagmi to pick up the connection)
      setConnectSuccess(true);
    } catch (error) {
      if (error instanceof ConnectorAlreadyConnectedError) {
        debug &&
          console.log(
            'web3/adapter/silk/use-auth:login: already connected, retrying',
          );
        await wagmiDisconnect();
        return await login();
      }
      console.error(
        'web3/adapter/silk/use-auth:login: error connecting to silk',
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
        error: error as Error,
      }));
      throw error;
    } finally {
      setState((prevState) => ({ ...prevState, authenticating: false }));
      loginRef.current = false;
    }
  }, [toast, connectors, wagmiConnectAsync, wagmiDisconnect]);

  const ready = useMemo(() => {
    const provider = getProvider();
    debug &&
      console.log(
        'web3/adapter/silk/use-auth:rememo ready',
        address,
        typeof provider,
        state.loading,
        typeof state.loading,
        reconnectingReadyUpdated,
      );
    if (!provider || !initialized) {
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:rememo ready: silk not yet initialized',
        );
      return false;
    }
    if (loginRef.current || reconnectingRef.current) {
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:rememo ready: in the middle of reconnect or login',
          loginRef.current,
          reconnectingRef.current,
        );
      return false;
    }
    if (typeof address === 'string' && address.startsWith('0x')) {
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:rememo ready: silk provided a address',
        );
      // silk has provided a address
      // via
      // - accountsChanged event
      // - requestWallet = eth_requestAccounts
      return true;
    }
    debug &&
      console.log(
        'web3/adapter/silk/use-auth:rememo ready: check loading state',
        state.loading === false,
        typeof state.loading === 'undefined',
      );
    return state.loading === false || typeof state.loading === 'undefined';
  }, [address, state.loading, initialized, reconnectingReadyUpdated]);

  useEffect(() => {
    if (
      typeof normalizedAddress !== 'string' ||
      !normalizedAddress.startsWith('0x') ||
      !ready
    ) {
      // no session ignore
      return;
    }
    if (reconnectingRef.current || loginRef.current) {
      return;
    }
    debug && console.log('web3/adapter/silk/use-auth:reconnect effect');
    reconnectingRef.current = true;
    wagmiReconnect(undefined, {
      onSettled: () => {
        debug &&
          console.log('web3/adapter/silk/use-auth:reconnect effect: done');
        reconnectingRef.current = false;
        setReconnectingReadyUpdated(Date.now());
      },
    });
  }, [normalizedAddress, wagmiReconnect, ready]);
  debug &&
    console.log('web3/adapter/silk/use-auth:render', {
      ready,
      normalizedAddress,
      isWagmiConnected,
    });
  return {
    address: normalizedAddress,
    wallet,
    authenticating: state.authenticating ?? false,
    error: state.error,
    login,
    logout,
    ready,
  };
}
