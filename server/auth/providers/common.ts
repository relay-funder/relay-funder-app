import { db } from '@/server/db';

export async function setupUser(address: string) {
  const normalizedAddress = address.toLowerCase();
  let dbUser = await db.user.findUnique({
    where: { address: normalizedAddress },
  });
  
  // Determine roles based on platform admin address
  const platformAdminAddress = process.env.NEXT_PUBLIC_PLATFORM_ADMIN?.toLowerCase();
  const isAdmin = platformAdminAddress && normalizedAddress === platformAdminAddress;
  const userRoles = isAdmin ? ['user', 'admin'] : ['user'];
  
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        address: normalizedAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: userRoles,
      },
    });
  } else if (isAdmin && !dbUser.roles.includes('admin')) {
    // Update existing user to add admin role if they're the platform admin
    dbUser = await db.user.update({
      where: { id: dbUser.id },
      data: {
        roles: [...new Set([...dbUser.roles, 'admin'])], // Add admin role if not present
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
