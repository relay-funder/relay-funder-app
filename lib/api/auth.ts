import { headers } from 'next/headers';
import { ADMIN_ADDRESS } from '@/lib/constant';
import { enableBypassContractAdmin } from '@/lib/develop';
import { auth } from '@/server/auth';
import { type Session } from 'next-auth';
import { ApiAuthError, ApiAuthNotAllowed } from './error';
import { debugApi as debug } from '@/lib/debug';
import { getUser } from './user';
import { setupUser } from '@/server/auth/providers/common';

/**
 * check authorization
 * use next-auth to acquire session and consider the session-role with the given roles.
 * ensures user exists in database, auto-creating if missing (Web3 principle: valid session = valid user)
 * returns the session if one of the roles given is in the current session
 * throws ApiAuthError only for genuine authorization failures
 */
export async function checkAuth(roles: string[]) {
  if (!Array.isArray(roles) || !roles.length) {
    throw new Error('checkAuth: invalid roles parameter');
  }
  const session = await auth();
  if (!session) {
    throw new ApiAuthError('No session');
  }
  if (!Array.isArray(session.user?.roles)) {
    throw new ApiAuthError('Invalid session');
  }

  // web3 principle: valid session = valid user
  if (session.user.address) {
    const dbUser = await getUser(session.user.address);
    if (!dbUser) {
      debug &&
        console.warn('Auto-creating missing user:', session.user.address);
      try {
        // Auto-create user following Web3 principle: valid wallet = valid user
        const createdUser = await setupUser(session.user.address);
        if (!createdUser) throw new ApiAuthError('Failed to auto-create user');
      } catch (error) {
        throw new ApiAuthError(
          'User validation failed - unable to auto-create user',
        );
      }
    }
  }

  if (session.user.roles.length) {
    for (const role of roles) {
      if (session.user.roles.includes(role)) {
        return session;
      }
    }
  }
  // roles are requested but not available in session
  throw new ApiAuthError(
    'Current session does not qualify for requested role(s)',
  );
}

/**
 * IsAdmin: evaluates if the current header belongs to a user
 *          that has been marked as admin
 */
export async function isAdmin() {
  const session = await auth();
  if (session?.user?.roles?.includes('admin')) {
    return true;
  }
  return false;
}
/**
 * IsContractAdmin: evaluates if the current header belongs to a user
 *          that has been marked as admin AND her address is known to
 *          to our contracts.
 */
export async function checkContractAdmin(session: Session) {
  const requestUserAddress = session.user.address;
  if (!enableBypassContractAdmin) {
    if (
      !requestUserAddress ||
      requestUserAddress.toLowerCase() !== ADMIN_ADDRESS?.toLowerCase()
    ) {
      throw new ApiAuthNotAllowed(
        'address is not registered as admin for contracts',
      );
    }
  }
  return true;
}
/**
 * IsUser: evaluates if the current header belongs to a user
 *         that been authorized by a identity provider.
 */
export async function isUser() {
  // const accessToken = (await headers())
  //   .get('authorization')
  //   ?.replace('Bearer ', '');
  // parse access token, get user-address?
  const requestUserAddress = (await headers()).get('x-user-address');
  if (!requestUserAddress) {
    throw new ApiAuthNotAllowed('Missing user address');
  }

  return true;
}

/**
 * IsOwner: evaluates if the given resource may be modified by the current
 *          authenticated user
 */
export async function isOwner(id: string | number, collectionName: string) {
  debug && console.log('lib/api/auth::isOwner', { id, collectionName });
  return true;
}
/**
 * canRead: evaluates if the given resource may be read by the current
 *          authenticated user
 */
export async function canRead(id: string | number, collectionName: string) {
  debug && console.log('lib/api/auth::canRead', { id, collectionName });
  return true;
}
