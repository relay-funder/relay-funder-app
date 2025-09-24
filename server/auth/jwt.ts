import { type User } from 'next-auth';
import { type JWT } from 'next-auth/jwt';

export async function jwt({
  token,
  user,
}: {
  token: JWT;
  user: User;
}): Promise<JWT> {
  if (user) {
    return {
      ...token,
      roles: user.roles,
      address: user.address.toLowerCase(), // Ensure address is normalized in JWT
      dbId: user.dbId,
    };
  }
  return token;
}
