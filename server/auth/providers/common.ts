import { db } from '@/server/db';

export async function setupUser(address: string) {
  const normalizedAddress = address.toLowerCase();
  let dbUser = await db.user.findUnique({
    where: { address: normalizedAddress },
  });
  if (!dbUser) {
    const roles = ['user'];
    if (
      process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' &&
      normalizedAddress.startsWith('0xadadad')
    ) {
      roles.push('admin');
    }
    dbUser = await db.user.create({
      data: {
        address: normalizedAddress,
        createdAt: new Date(),
        roles,
      },
    });
  }
  if (dbUser) {
    return { ...dbUser, dbId: dbUser.id, id: `${dbUser.id}` };
  }
  return null;
}
/**
 * output a single line with the error to allow ingestion by eg cloudwatch
 */
export function handleError(error: unknown) {
  if (typeof error === 'string') {
    console.error(
      JSON.stringify({
        type: 'error',
        message: 'authorize:' + error,
      }),
    );
  }
  if (error instanceof Error) {
    console.error(
      JSON.stringify({
        type: 'error',
        message: 'authorize:' + error.message,
        origin: error,
      }),
    );
  }
}
