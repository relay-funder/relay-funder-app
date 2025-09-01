import { db, Payment } from '@/server/db';
import { DisplayUserWithStates } from './types/user';

export function getUserNameFromInstance(
  instance?: { username?: string | null; firstName?: string | null } | null,
) {
  if (instance?.username) {
    return instance.username;
  } else if (instance?.firstName) {
    return instance.firstName;
  }
  return null;
}
export async function getUserWithStates(address?: string | null) {
  const creator: DisplayUserWithStates = {
    name: null,
    address: null,
    isKycCompleted: false,
  };
  try {
    if (address) {
      const instance = await db.user.findUnique({
        where: { address },
      });
      if (instance?.isKycCompleted) {
        creator.isKycCompleted = true;
      }
      creator.name = getUserNameFromInstance(instance);
      if (instance?.address) {
        creator.address = instance.address;
      }
    }
  } catch {}
  return creator;
}
/**
 * Get the user sanitized depending on their request to anonymize the payment
 *
 * Only returns whitelisted fields
 */
const ANONYM_ADDRESS = '0x00000000000000000000000000000000';
export function getPaymentUser(
  payment:
    | (Payment & {
        user: {
          username: string | null;
          lastName: string | null;
          firstName: string | null;
          address: string;
        } | null;
      })
    | null,
) {
  return {
    name: payment?.isAnonymous
      ? 'Anonym'
      : getUserNameFromInstance(payment?.user),
    address: payment?.isAnonymous
      ? ANONYM_ADDRESS
      : (payment?.user?.address ?? null),
  };
}
