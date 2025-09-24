import { db } from '@/server/db';
import { debugAuth as debug } from '@/lib/debug';

export async function setupUser(address: string) {
  const normalizedAddress = address.toLowerCase();
  debug &&
    console.log('setupUser called with:', {
      originalAddress: address,
      normalizedAddress,
    });

  let dbUser = await db.user.findUnique({
    where: { address: normalizedAddress },
  });

  debug &&
    console.log(
      'Existing user found:',
      dbUser ? { id: dbUser.id, address: dbUser.address } : null,
    );

  // Determine roles based on platform admin address and mock auth
  const platformAdminAddress =
    process.env.NEXT_PUBLIC_PLATFORM_ADMIN?.toLowerCase();
  const isPlatformAdmin =
    platformAdminAddress && normalizedAddress === platformAdminAddress;
  const isMockAdmin =
    process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' &&
    normalizedAddress.startsWith('0xadadad');
  const userRoles = ['user'];

  if (isPlatformAdmin || isMockAdmin) {
    userRoles.push('admin');
  }

  if (!dbUser) {
    debug &&
      console.log('Creating new user with:', { normalizedAddress, userRoles });
    dbUser = await db.user.create({
      data: {
        address: normalizedAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: userRoles,
      },
    });
    debug &&
      console.log('New user created:', {
        id: dbUser.id,
        address: dbUser.address,
      });
  } else {
    // Check if user needs role updates
    const needsAdminRole =
      (isPlatformAdmin || isMockAdmin) && !dbUser.roles.includes('admin');
    const hasExtraRoles = dbUser.roles.some(
      (role) => !userRoles.includes(role),
    );

    if (needsAdminRole || hasExtraRoles) {
      const updatedRoles = [...new Set([...dbUser.roles, ...userRoles])];
      dbUser = await db.user.update({
        where: { id: dbUser.id },
        data: {
          roles: updatedRoles,
          updatedAt: new Date(),
        },
      });
    }
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
