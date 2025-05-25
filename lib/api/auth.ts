import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { ADMIN_ADDRESS } from '@/lib/constant';
import { enableBypassContractAdmin } from '@/lib/develop';
/**
 * not authorized: the resource accessed requires authorization but
 *                 the required header was not found
 */
export async function notAuthorized() {
  return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
}
/**
 * not authorized: the resource accessed is not accessible to the
 *                 authorization provided.
 */
export async function notAllowed() {
  return NextResponse.json(
    { error: 'No permission to access resource' },
    { status: 403 },
  );
}
/**
 * IsAdmin: evaluates if the current header belongs to a user
 *          that has been marked as admin
 */
export async function isAdmin() {
  return true;
}
/**
 * IsContractAdmin: evaluates if the current header belongs to a user
 *          that has been marked as admin AND her address is known to
 *          to our contracts.
 */
export async function isContractAdmin() {
  const requestUserAddress = (await headers()).get('x-user-address');
  if (!enableBypassContractAdmin) {
    if (
      !requestUserAddress ||
      requestUserAddress.toLowerCase() !== ADMIN_ADDRESS?.toLowerCase()
    ) {
      return notAllowed();
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
    return notAllowed();
  }

  return true;
}

/**
 * IsOwner: evaluates if the given resource may be modified by the current
 *          authenticated user
 */
export async function isOwner(id: string | number, collectionName: string) {
  console.log({ id, collectionName });
  return true;
}
/**
 * canRead: evaluates if the given resource may be read by the current
 *          authenticated user
 */
export async function canRead(id: string | number, collectionName: string) {
  console.log({ id, collectionName });
  return true;
}
