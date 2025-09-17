import { db, type Payment, type Prisma } from '@/server/db';
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

export async function getUser(address: string) {
  const instance = await db.user.findUnique({
    where: { address },
    include: {
      _count: {
        select: {
          collections: true,
          payments: true,
          paymentMethods: true,
          createdMedia: true,
          withdrawals: true,
          approvals: true,
        },
      },
    },
  });
  return instance;
}

export async function listUsers({
  name,
  page = 1,
  pageSize = 10,
  skip = 0,
}: {
  name?: string;
  page?: number;
  pageSize?: number;
  skip?: number;
}) {
  const where: Prisma.UserWhereInput = {};
  if (name) {
    where.OR = [];
    where.OR.push({ username: { contains: name, mode: 'insensitive' } });
    where.OR.push({ firstName: { contains: name, mode: 'insensitive' } });
    where.OR.push({ lastName: { contains: name, mode: 'insensitive' } });
  }
  const [dbUsers, totalCount] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    users: dbUsers,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}

export async function updateUserFlags(address: string, featureFlags: string[]) {
  return await db.user.update({ where: { address }, data: { featureFlags } });
}
export async function updateUserRoles(address: string, roles: string[]) {
  return await db.user.update({ where: { address }, data: { roles } });
}
export async function updateUserEmail(address: string, email: string) {
  return await db.user.update({ where: { address }, data: { email } });
}
export async function updateUserNames(
  address: string,
  username?: string,
  firstName?: string | null,
  lastName?: string | null,
) {
  return await db.user.update({
    where: { address },
    data: { username, firstName, lastName },
  });
}
export async function updateUserBio(address: string, bio: string | null) {
  return await db.user.update({ where: { address }, data: { bio } });
}
export async function updateUserRecipientWallet(
  address: string,
  recipientWallet: string | null,
) {
  return await db.user.update({
    where: { address },
    data: { recipientWallet },
  });
}
export async function updateUserKycStatus(
  address: string,
  isKycCompleted: boolean | null,
) {
  return await db.user.update({ where: { address }, data: { isKycCompleted } });
}

export async function updateHumanityScore(
  address: string,
  humanityScore: number,
) {
  await db.user.update({ where: { address }, data: { humanityScore } });
  await db.roundContribution.updateMany({
    where: {
      AND: [
        { payment: { user: { address } } },
        { roundCampaign: { Round: { status: { not: 'CLOSED' } } } },
      ],
    },
    data: { humanityScore },
  });
}
