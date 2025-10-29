import { type DefaultSession, type NextAuthConfig } from 'next-auth';

import { SiweProvider } from '@/server/auth/providers';
import { db } from '@/server/db';
import { jwt } from '@/server/auth/jwt';
import { session } from '@/server/auth/session';
import { AUTH_SESSION_LIFETIME } from '@/lib/constant/server';
import { ONE_DAY_S } from '@/lib/constant/time';

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface User {
    dbId: number;
    address: string;
    roles: string[];
  }
  interface Session extends DefaultSession {
    user: User & DefaultSession['user'];
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[];
    address?: string;
  }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [SiweProvider()],
  pages: {
    signIn: '/login',
  },
  events: {
    signIn: async ({ user }) => {
      /**
       * record when the user decided to sign in
       */
      const instance = await db.user.findUnique({
        where: { id: user.dbId },
      });
      if (!instance) {
        throw new Error('bad user instance');
      }
      if (instance.lastSigninAt) {
        await db.user.update({
          where: { id: instance.id },
          data: { prevSigninAt: instance.lastSigninAt },
        });
      }
      await db.user.update({
        where: { id: instance.id },
        data: { lastSigninAt: new Date() },
      });
    },
    signOut: async (message) => {
      /**
       * record when the user decided to sign out
       */
      if (!('token' in message)) {
        return;
      }
      const token = message.token;
      if (!token?.sub) {
        return;
      }
      await db.user.update({
        where: { id: parseInt(token.sub) },
        data: { lastSignoutAt: new Date() },
      });
    },
  },
  callbacks: {
    jwt,
    session,
  },
  session: {
    strategy: 'jwt',
    // maximum age the session is valid, in seconds
    maxAge: AUTH_SESSION_LIFETIME * ONE_DAY_S,
    // update session when at least that age, causing client to get
    // a maximum session lifetime again
    // for short session lifetimes (less than one day) half the lifetime
    // for normal session lifetimes, once a day (sane nextauth-default)
    updateAge:
      AUTH_SESSION_LIFETIME > 1
        ? 1 * ONE_DAY_S
        : (AUTH_SESSION_LIFETIME / 2) * ONE_DAY_S,
  },
} satisfies NextAuthConfig;
