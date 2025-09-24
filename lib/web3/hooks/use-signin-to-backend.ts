import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getCsrfToken,
  getSession,
  signIn as nextAuthSignIn,
} from 'next-auth/react';
import { SiweMessage } from 'siwe';
import {
  ethers,
  useAccount,
  useSignMessage,
  getProvider,
  UserRejectedRequestError,
} from '@/lib/web3';
import { PROJECT_NAME } from '@/lib/constant';

import { debugWeb3UseAuth as debug } from '@/lib/debug';

async function fetchNonce() {
  try {
    return await getCsrfToken();
  } catch (error) {
    console.error('Failure fetching nonce (next-auth csrf-token)');
  }
  return;
}
export function useSignInToBackend() {
  const params = useSearchParams();
  const callbackUrl = useMemo(() => {
    const paramCallbackUrl = params?.get('callbackUrl');

    // Prevent cross-domain callbacks on preview/branch deployments
    // Check if current domain matches patterns where external callbacks should be blocked
    if (
      typeof window !== 'undefined' &&
      paramCallbackUrl &&
      !paramCallbackUrl.startsWith('/')
    ) {
      try {
        const callbackDomain = new URL(paramCallbackUrl).hostname;
        const currentDomain = window.location.hostname;

        // Get domain patterns from environment variable
        const blockPatterns =
          process.env.NEXT_PUBLIC_BLOCK_EXTERNAL_CALLBACK_DOMAINS?.split(
            ',',
          ).map((p) => p.trim()) || [];

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
      } catch {
        // Invalid URL, use dashboard
        return '/dashboard';
      }
    }

    return paramCallbackUrl || '/dashboard';
  }, [params]);
  const { signMessageAsync } = useSignMessage();
  const account = useAccount();

  const signInToBackend = useCallback(async () => {
    // this callback relies on wagmi being connected
    // so it must not be called directly within a event also calling
    // connect (useConnect) but wait for the connection to be available
    const { address, chainId } = account;

    debug &&
      console.log('web3/hooks/use-signin-to-backend', {
        address,
        chainId,
        domain: window.location.host,
        origin: window.location.origin,
        callbackUrl,
      });
    if (!address || typeof chainId !== 'number') {
      throw new Error(
        'web3/hooks/use-signin-to-backend: missing address or chainId',
      );
    }

    const nonce = await fetchNonce();
    if (!nonce) {
      throw new Error(
        'web3/hooks/use-signin-to-backend: Failed to fetch nonce for signature',
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
        'web3/hooks/use-signin-to-backend: Wagmi signMessageAsync not found',
      );
    }
    let signature = '';
    try {
      signature = await signMessageAsync({
        message: preparedMessage,
      });
    } catch (error: unknown) {
      // signMessageAsync cannot work because the wagmi connector is not set yet
      // that signature would only work if we detach the nextauth login from the wagmi connect
      // in a way that react could process the contexts&providers
      // const signature = await signMessageAsync({
      //   message: preparedMessage,
      // });
      if (error instanceof UserRejectedRequestError) {
        throw error;
      }
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
      signature = (await updatedProvider.request({
        method: 'personal_sign',
        params: [
          ethers.hexlify(ethers.toUtf8Bytes(preparedMessage)),
          ethers.getAddress(address),
        ],
      })) as string;
    }

    debug &&
      console.log('web3/hooks/use-signin-to-backend: login to next-auth');
    const authResult = await nextAuthSignIn('siwe', {
      redirect: false,
      message: JSON.stringify(preparedMessage),
      signature,
      callbackUrl,
    });
    if (authResult?.ok && !authResult.error) {
      const session = await getSession();
      console.info(
        'web3/hooks/use-signin-to-backend: user signed in',
        session?.user?.name,
        session?.user?.address,
      );
    } else if (authResult?.error) {
      const errorMessage =
        'web3/hooks/use-signin-to-backend:' +
        ' An error occurred while signin in.' +
        ` Code: ${authResult.status} - ${authResult.error}` +
        ` (Domain: ${window.location.host})`;
      console.error('Authentication failed:', {
        status: authResult.status,
        error: authResult.error,
        domain: window.location.host,
        callbackUrl,
        vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
      });
      throw new Error(errorMessage);
    }
    return callbackUrl;
  }, [callbackUrl, signMessageAsync, account]);
  return signInToBackend;
}
