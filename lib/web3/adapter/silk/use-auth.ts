import {
  getCsrfToken,
  getSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

import { SiweMessage } from 'siwe';
import { UserRejectedRequestError } from 'viem';
import {
  useAccount,
  useConnect,
  useReconnect,
  useDisconnect,
  useSignMessage,
} from 'wagmi';

import { chainConfig } from '@/lib/web3/config/chain';

import { PROJECT_NAME } from '@/lib/constant';
import { useToast } from '@/hooks/use-toast';
import type { IWeb3UseAuthHook } from '@/lib/web3/types';
import { useWeb3Context, getProvider } from './context-provider';
import { ConnectorAlreadyConnectedError } from 'wagmi';
import { ethers } from 'ethers';
import { debugWeb3UseAuth as debug } from '@/lib/debug';

async function fetchNonce() {
  try {
    return await getCsrfToken();
  } catch (error) {
    console.error('Failure fetching nonce (next-auth csrf-token)');
  }
  return;
}
/**
 * Handles wagmi connect, signMessage, and logout using the Silk wallet.
 * @returns
 */
export function useAuth(): IWeb3UseAuthHook {
  const [state, setState] = useState<{
    loading?: boolean;
    error?: Error;
  }>({});
  const { toast } = useToast();
  const {
    requestWallet,
    address: web3ContextAddress,
    initialized,
  } = useWeb3Context();

  const { connectAsync: wagmiConnect, connectors } = useConnect();
  const { address, isConnected: isWagmiConnected } = useAccount();
  const { reconnect: wagmiReconnect } = useReconnect();
  const { disconnectAsync: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const params = useSearchParams();
  const callbackUrl = useMemo(
    () => params?.get('callbackUrl') || '/dashboard',
    [params],
  );
  const reconnectingRef = useRef(false);
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
  const authenticated = useMemo(() => {
    return typeof normalizedAddress === 'string';
  }, [normalizedAddress]);
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

  const signInToBackend = useCallback(async () => {
    try {
      // we cannot rely on state here as login() has altered window values
      const { address, chainId } = await requestWallet();
      debug &&
        console.log('web3/adapter/silk/use-auth:signInToBackend', {
          address,
          chainId,
        });
      if (!address || typeof chainId !== 'number') {
        throw new Error(
          'web3/adapter/silk/use-auth:signInToBackend: missing address or chainId',
        );
      }

      setState((prevState) => ({
        ...prevState,
        loading: true,
        error: undefined,
      }));
      const nonce = await fetchNonce();
      if (!nonce) {
        throw new Error(
          'web3/adapter/silk/use-auth:signInToBackend: Failed to fetch nonce for signature',
        );
      }
      // Create SIWE message with pre-fetched nonce and sign with wallet
      const message = new SiweMessage({
        domain: window.location.host,
        address: ethers.getAddress(address),
        statement: `${PROJECT_NAME} - Please sign this message to log in to the app.`,
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });

      const preparedMessage = message.prepareMessage();
      if (typeof signMessageAsync !== 'function') {
        throw new Error(
          'web3/adapter/silk/use-auth:signInToBackend: Wagmi signMessageAsync not found',
        );
      }
      // signMessageAsync cannot work because the wagmi connector is not set yet
      // that signature would only work if we detach the nextauth login from the wagmi connect
      // in a way that react could process the contexts&providers
      // const signature = await signMessageAsync({
      //   message: preparedMessage,
      // });
      const provider = getProvider();
      if (!provider) {
        throw new Error(
          'web3/adapter/silk/use-auth:signInToBackend: Wallet is not loaded',
        );
      }
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:signInToBackend: request signature',
        );
      const updatedProvider = getProvider();
      if (!updatedProvider) {
        throw new Error('Provider no longer available');
      }
      const signature = await updatedProvider.request({
        method: 'personal_sign',
        params: [
          ethers.hexlify(ethers.toUtf8Bytes(preparedMessage)),
          ethers.getAddress(address),
        ],
      });

      debug &&
        console.log(
          'web3/adapter/silk/use-auth:signInToBackend: login to next-auth',
        );
      const authResult = await nextAuthSignIn('siwe', {
        redirect: false,
        message: JSON.stringify(message),
        signature,
        callbackUrl,
      });
      if (authResult?.ok && !authResult.error) {
        const session = await getSession();
        console.info(
          'web3/adapter/silk/use-auth:signInToBackend: user signed in',
          session?.user?.name,
          session?.user?.address,
        );
      } else if (authResult?.error) {
        const errorMessage =
          'web3/adapter/silk/use-auth:signInToBackend:' +
          ' An error occurred while signin in.' +
          ` Code: ${authResult.status} - ${authResult.error}`;
        console.error(errorMessage);
        setState((prevState) => ({
          ...prevState,
          error: new Error(
            authResult.error ||
              'web3/adapter/silk/use-auth:signInToBackend: Unable to authenticate the message',
          ),
        }));
      }

      setState((prevState) => ({ ...prevState, loading: false }));
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        error: error as Error,
      }));
    }
  }, [callbackUrl, signMessageAsync, requestWallet]);

  const login = useCallback(async () => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
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
      //await window.silk.login();
      const connectResult = await wagmiConnect({
        chainId: defaultChain.id,
        connector: loadedSilkConnector,
      });
      debug &&
        console.log(
          'web3/adapter/silk/use-auth:login: connect to wallet complete continue with login to next-auth',
          connectResult,
        );

      await signInToBackend();
      setState((prevState) => ({ ...prevState, loading: false }));
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
      if (error instanceof UserRejectedRequestError)
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Operation cancelled by user',
        });
      else
        setState((prevState) => ({
          ...prevState,
          loading: false,
          error: error as Error,
        }));
    } finally {
      loginRef.current = false;
    }
  }, [toast, connectors, wagmiConnect, wagmiDisconnect, signInToBackend]);

  const ready = useMemo(() => {
    const provider = getProvider();
    debug &&
      console.log(
        'web3/adapter/silk/use-auth:rememo ready',
        address,
        typeof provider,
        state.loading,
        typeof state.loading,
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
  }, [address, state.loading, initialized]);

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
      },
    });
  }, [normalizedAddress, wagmiReconnect, ready]);
  debug &&
    console.log('web3/adapter/silk/use-auth:render', {
      ready,
      authenticated,
      normalizedAddress,
      isWagmiConnected,
    });
  return {
    address: normalizedAddress,
    wallet,
    authenticated,
    login,
    logout,
    ready,
  };
}
