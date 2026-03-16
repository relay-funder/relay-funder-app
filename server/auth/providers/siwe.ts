import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

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
import { IS_PRODUCTION } from '@/lib/utils/env';

// An indicator to show that system environment variables have been exposed to your project's Deployments.
const VERCEL = process.env.VERCEL ?? '0';
// The domain name of the generated deployment URL. Example: *.vercel.app.
// The value does not include the protocol scheme https://.
const VERCEL_URL = process.env.VERCEL_URL ?? null;
// A production domain name of the project. We select the shortest production
// custom domain, or vercel.app domain if no custom domain is available.
// Note, that this is always set, even in preview deployments.
// This is useful to reliably generate links that point to production such as
// OG-image URLs. The value does not include the protocol scheme https://.
const VERCEL_PROJECT_PRODUCTION_URL =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null;
// The environment that the app is deployed and running on.
// The value can be either production, preview, or development.
const VERCEL_ENV = process.env.VERCEL_ENV ?? 'production';
// The git branch of the commit the deployment was triggered by.
const VERCEL_GIT_COMMIT_REF = process.env.VERCEL_GIT_COMMIT_REF ?? 'main';
// The environment that configures a static next-auth host responsible
// for checking the environment variables
// this should not be set for VERCEL according to next-auth docs
const NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? null;

/**
 * Get Auth Host
 * returns the Host (without http) that the application is running on.
 * Supported patterns are:
 *   production: client visits VERCEL_PROJECT_PRODUCTION_URL
 *   staging: client visits VERCEL_PROJECT_PRODUCTION_URL, app. replaced with staging.app.
 *   preview: client visits VERCEL_URL
 *   local: client visits NEXTAUTH_URL
 */
function getAuthHost() {
  debug &&
    console.log('server::auth::providers::siwe::getAuthHost', {
      VERCEL,
      VERCEL_ENV,
      VERCEL_PROJECT_PRODUCTION_URL,
      VERCEL_GIT_COMMIT_REF,
      NEXTAUTH_URL,
    });
  if (VERCEL === '1') {
    // production -> VERCEL_PROJECT_PRODUCTION_URL
    // do not allow production to use any other host than the configured
    // VERCEL_PROJECT_PRODUCTION_URL to be used.
    if (VERCEL_ENV === 'production') {
      return VERCEL_PROJECT_PRODUCTION_URL;
    }

    // preview -> VERCEL_URL (for branch deployments), NEXTAUTH_URL for staging
    if (
      VERCEL_GIT_COMMIT_REF === 'staging' &&
      typeof VERCEL_PROJECT_PRODUCTION_URL === 'string'
    ) {
      return VERCEL_PROJECT_PRODUCTION_URL.replace(/app\./, 'staging.app.');
    }
    return VERCEL_URL;
  }
  // local
  if (!NEXTAUTH_URL) {
    throw new Error('Environment configuration error: NEXTAUTH_URL is missing');
  }
  return NEXTAUTH_URL.replace(/http:\/\//, '');
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
        const nextAuthHost = getAuthHost();
        if (!nextAuthHost) {
          throw new Error(
            'no nextAuthHost (NEXTAUTH_URL,VERCEL_URL) - environment not configured correctly',
          );
        }

        if (
          // on production, the auth should always be active, the only
          // exception is when we want to deploy with the dummy-web3-context
          // (which needs a changed & committed @/lib/web3/adapter import
          (!IS_PRODUCTION ||
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
