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
  };
  try {
    if (address) {
      const instance = await db.user.findUnique({
        where: { address },
      });
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
  if (!address) {
    return null;
  }

  const normalizedAddress = address.toLowerCase();

  const instance = await db.user.findUnique({
    where: { address: normalizedAddress },
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
    where.OR.push({ address: { startsWith: name, mode: 'insensitive' } });
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

export async function updateEventFeedRead(address: string) {
  await db.user.update({
    where: { address },
    data: { eventFeedRead: new Date() },
  });
}

export async function listUserEventFeed({
  user,
  type,
  startDate,
  endDate,
  page = 1,
  pageSize = 10,
}: {
  user: { id: number };
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.EventFeedWhereInput = {
    AND: [{ receiverId: user.id }],
  };
  const filter: Prisma.EventFeedWhereInput = { OR: [] };
  if (type) {
    filter.OR?.push({ type });
  }
  if (startDate || endDate) {
    if (startDate) {
      filter.OR?.push({ AND: [{ createdAt: { lt: new Date(startDate) } }] });
    }
    if (endDate && !startDate) {
      filter.OR?.push({ createdAt: { gt: new Date(endDate) } });
    } else if (endDate) {
      const dateCondition = filter.OR?.find((expr) => Array.isArray(expr.AND));
      if (Array.isArray(dateCondition?.AND)) {
        dateCondition?.AND?.push({
          createdAt: { gt: new Date(endDate) },
        });
      }
    }
  }
  if (filter.OR?.length && Array.isArray(where.AND)) {
    where.AND.push(filter);
  }
  const [dbFeedEvents, totalCount] = await Promise.all([
    db.eventFeed.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.eventFeed.count({ where }),
  ]);

  return {
    events: dbFeedEvents,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}

export async function listAdminEventFeed({
  type,
  startDate,
  endDate,
  page = 1,
  pageSize = 10,
}: {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  const where: Prisma.EventFeedWhereInput = {};
  const filter: Prisma.EventFeedWhereInput = { OR: [] };
  if (type) {
    filter.OR?.push({ type });
  }
  if (startDate || endDate) {
    if (startDate) {
      filter.OR?.push({ AND: [{ createdAt: { lt: new Date(startDate) } }] });
    }
    if (endDate && !startDate) {
      filter.OR?.push({ createdAt: { gt: new Date(endDate) } });
    } else if (endDate) {
      const dateCondition = filter.OR?.find((expr) => Array.isArray(expr.AND));
      if (Array.isArray(dateCondition?.AND)) {
        dateCondition?.AND?.push({
          createdAt: { gt: new Date(endDate) },
        });
      }
    }
  }
  if (filter.OR?.length) {
    Object.assign(where, filter);
  }
  const [dbFeedEvents, totalCount] = await Promise.all([
    db.eventFeed.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.eventFeed.count({ where }),
  ]);

  return {
    events: dbFeedEvents,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}
