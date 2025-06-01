import { db } from '@/server/db';
export async function setupUser(address: string) {
  const normalizedAddress = address.toLowerCase();
  let dbUser = await db.user.findUnique({
    where: { address: normalizedAddress },
  });
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        address: normalizedAddress,
        createdAt: new Date(),
        roles: ['user'],
      },
    });
  }
  if (dbUser) {
    return { ...dbUser, dbId: dbUser.id, id: `${dbUser.id}` };
  }
  return null;
}
export function handleError(error: unknown) {
  if (typeof error === 'string') {
    console.error(
      JSON.stringify({
        type: 'error',
        message: 'PrivyTokenProvider::authorize:' + error,
      }),
    );
  }
  if (error instanceof Error) {
    console.error({ error });
    console.error(
      JSON.stringify({
        type: 'error',
        message: 'PrivyTokenProvider::authorize:' + error.message,
        origin: error,
      }),
    );
  }
}
