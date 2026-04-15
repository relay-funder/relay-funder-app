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
import { resolveAuthHost } from './siwe-host';

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
        const headerStore = await headers();
        const nextAuthHost = resolveAuthHost({
          forwardedHost: headerStore.get('x-forwarded-host'),
          requestHost: headerStore.get('host'),
          nextAuthUrl: process.env.NEXTAUTH_URL ?? null,
          nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? null,
        });
        if (!nextAuthHost) {
          throw new Error(
            'no nextAuthHost (request host or auth env) - environment not configured correctly',
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
            vercelUrl: process.env.VERCEL_URL,
            nodeEnv: process.env.NODE_ENV,
          });

        if (siwe.domain !== nextAuthHost) {
          console.error('auth::siwe::siwe-host', {
            siwedomain: siwe.domain,
            nextAuthHost,
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
        // for the moment, the verifySignature is not working with social
        // logins and emails  with non deployed smart accounts
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
        const rawAddress = messageAddress;
        return await setupUser(rawAddress);
      } catch (error: unknown) {
        handleError(error);
      }
      return null;
    },
  });
}
