import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

import { SiweMessage } from 'siwe';
import { db } from '@/server/db';
import { type User } from 'next-auth';

const nextAuthUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

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
        console.log('authorize', { credentials });
        if (
          typeof credentials?.message !== 'string' ||
          typeof credentials?.signature !== 'string'
        ) {
          throw new Error('SiweMessage is undefined');
        }
        if (!nextAuthUrl) {
          console.log(
            'no nextAuthUrl (NEXTAUTH_URL,VERCEL_URL) - environment not configured correctly',
            nextAuthUrl,
          );
          return null;
        }

        const nextAuthHost = new URL(nextAuthUrl).host;

        // Get CSRF token from cookie using the new async approach
        const headerCookies = await cookies();
        const csrfToken = headerCookies.get('authjs.csrf-token');
        const nonce = csrfToken?.value.split('|')[0];
        const { message, signature } = credentials;
        const siwe = new SiweMessage(JSON.parse(message));
        if (siwe.domain !== nextAuthHost) {
          console.log('siwe.verify succeded but for a different domain');
          return null;
        }
        if (siwe.nonce !== nonce) {
          console.log('siwe.verify succeded but for a different nonce');
          return null;
        }
        const verificationParams = {
          signature,
        };
        console.log('verify');
        const result = await siwe.verify(verificationParams);
        console.log('result', result);
        if (!result.success) {
          console.log('siwe.verify failed');
          return null;
        }
        const address = siwe.address;
        let dbUser = await db.user.findUnique({
          where: { address },
        });
        if (!dbUser) {
          dbUser = await db.user.create({
            data: {
              address,
              createdAt: new Date(),
              roles: ['user'],
            },
          });
        }
        if (dbUser) {
          return { ...dbUser, id: `${dbUser.id}` };
        }
      } catch (error: unknown) {
        if (typeof error === 'string') {
          console.error(
            JSON.stringify({
              type: 'error',
              message: 'SiweProvider::authorize:' + error,
            }),
          );
        }
        if (error instanceof Error) {
          console.error({ error });
          console.error(
            JSON.stringify({
              type: 'error',
              message: 'SiweProvider::authorize:' + error.message,
              origin: error,
            }),
          );
        }
      }
      return null;
    },
  });
}
