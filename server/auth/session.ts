import { normalizeAddress } from '@/lib/normalize-address';
import { type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';

export async function session({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Promise<Session> {
  return {
    ...session,
    user: {
      ...session.user,
      id: token.sub ?? '0',
      dbId: parseInt((token.dbId as string) ?? '0'),
      roles: token.roles ?? [],
      address: normalizeAddress(token.address) ?? '', // Ensure address is always lowercase
    },
  };
}
