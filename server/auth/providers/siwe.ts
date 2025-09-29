import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies, headers } from 'next/headers';

import { SiweMessage } from 'siwe';
import { setupUser, handleError } from './common';
import { type User } from 'next-auth';
import { debugAuth as debug } from '@/lib/debug';
import { createPublicClient, http } from 'viem';
import {
  getAddressFromMessage,
  getChainIdFromMessage,
} from '@reown/appkit-siwe';
import { REOWN_CLOUD_PROJECT_ID } from '@/lib/constant';

async function getAuthUrl(): Promise<string | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') || 'https';

    if (host) {
      // Check if current domain matches deployment domain patterns (e.g., .vercel.app, .netlify.app)
      const deploymentPatterns =
        process.env.NEXT_PUBLIC_BLOCK_EXTERNAL_CALLBACK_DOMAINS?.split(',').map(
          (p) => p.trim(),
        ) || [];
      const isDeploymentDomain = deploymentPatterns.some((pattern) => {
        // Support wildcards and exact matches
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(host);
        }
        return host.includes(pattern);
      });

      if (isDeploymentDomain) {
        debug &&
          console.log('Deployment domain detected, using request headers:', {
            host,
            proto,
            patterns: deploymentPatterns,
          });
        return `${proto}://${host}`;
      } else {
        debug && console.log('Custom domain detected, using NEXTAUTH_URL');
        return process.env.NEXTAUTH_URL || `${proto}://${host}`;
      }
    }
  } catch (error) {
    debug && console.warn('Failed to get host from headers:', error);
  }

  // Fallback to environment variables
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return null;
}

export function SiweProvider() {
  return CredentialsProvider({
    name: 'siwe',
    id: 'siwe',
    credentials: {
      message: {
        label: 'Message',
        type: 'text',
        placeholder: '0x0',
      },
      signature: {
        label: 'Signature',
        type: 'text',
        placeholder: '0x0',
      },
    },
    async authorize(credentials): Promise<User | null> {
      try {
        debug && console.log('authorize', { credentials });
        if (
          typeof credentials?.message !== 'string' ||
          typeof credentials?.signature !== 'string'
        ) {
          throw new Error('SiweMessage is undefined');
        }
        const nextAuthUrl = await getAuthUrl();
        if (!nextAuthUrl) {
          throw new Error(
            'no nextAuthUrl (NEXTAUTH_URL,VERCEL_URL,host header) - environment not configured correctly',
          );
        }

        if (
          // on production, the auth should always be active, the only
          // exception is when we want to deploy with the dummy-web3-context
          // (which needs a changed & committed @/lib/web3/adapter import
          (process.env.NODE_ENV !== 'production' ||
            process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') &&
          credentials.message === credentials.signature
        ) {
          return await setupUser(credentials.message);
        }

        const nextAuthHost = new URL(nextAuthUrl).host;

        // Get CSRF token from cookie with production __Host prefix as well
        const headerCookies = await cookies();
        const csrfTokenLocal = headerCookies.get('authjs.csrf-token');
        const csrfTokenHost = headerCookies.get('__Host-authjs.csrf-token');
        const csrfToken = csrfTokenHost ?? csrfTokenLocal;
        const nonce = csrfToken?.value.split('|')[0];
        const { message, signature } = credentials;
        const siwe = new SiweMessage(message);

        debug &&
          console.log('SIWE domain verification:', {
            siweDomain: siwe.domain,
            nextAuthHost,
            nextAuthUrl,
            vercelUrl: process.env.VERCEL_URL,
            nodeEnv: process.env.NODE_ENV,
          });

        if (siwe.domain !== nextAuthHost) {
          console.error('auth::siwe::siwe-host', {
            siwedomain: siwe.domain,
            nextAuthHost,
            nextAuthUrl,
            vercelUrl: process.env.VERCEL_URL,
          });
          throw new Error('siwe.verify succeeded but for a different domain');
        }
        if (siwe.nonce !== nonce) {
          console.error('auth::siwe::siwe-nonce', {
            siwenonce: siwe.nonce,
            nonce,
          });
          throw new Error('siwe.verify succeeded but for a different nonce');
        }
        const messageAddress = getAddressFromMessage(message);
        const chainId = getChainIdFromMessage(message);
        debug && console.log('verify');
        // for the moment, the verifySignature is not working with social logins and emails  with non deployed smart accounts
        // we are going to use https://viem.sh/docs/actions/public/verifyMessage.html
        const publicClient = createPublicClient({
          transport: http(
            `https://rpc.walletconnect.org/v1/?chainId=${chainId}&projectId=${REOWN_CLOUD_PROJECT_ID}`,
          ),
        });
        const isValid = await publicClient.verifyMessage({
          message,
          address: messageAddress as `0x${string}`,
          signature: signature as `0x${string}`,
        });
        if (!isValid) {
          debug &&
            console.log('result', {
              isValid,
              message,
              messageAddress,
              signature,
            });
          throw new Error('siwe.verify failed');
        }
        const address = messageAddress;
        return await setupUser(address);
      } catch (error: unknown) {
        handleError(error);
      }
      return null;
    },
  });
}
