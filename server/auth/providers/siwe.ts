import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies, headers } from 'next/headers';

import { SiweMessage } from 'siwe';
import { setupUser, handleError } from './common';
import { type User } from 'next-auth';
import { debugAuth as debug } from '@/lib/debug';

function getAuthUrl(): string {
  // Use NEXTAUTH_URL if explicitly set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // For dynamic deployments, construct URL from request headers
  try {
    const headersList = headers();
    const host = headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') || 'https';

    if (host) {
      return `${proto}://${host}`;
    }
  } catch (error) {
    debug && console.warn('Failed to get host from headers:', error);
  }

  // Fallback to VERCEL_URL
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
        const nextAuthUrl = getAuthUrl();
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
        const siwe = new SiweMessage(JSON.parse(message));

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
        const verificationParams = {
          signature,
        };
        debug && console.log('verify');
        const result = await siwe.verify(verificationParams);
        debug && console.log('result', result);
        if (!result.success) {
          throw new Error('siwe.verify failed');
        }
        const address = siwe.address;
        return await setupUser(address);
      } catch (error: unknown) {
        handleError(error);
      }
      return null;
    },
  });
}
