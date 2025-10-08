import { db, type Payment, Prisma } from '@/server/db';
import { DisplayUserWithStates } from './types/user';

export function isProfileComplete(
  user: {
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    email?: string | null;
  } | null,
): boolean {
  return !!(user?.firstName && user?.lastName && user?.username && user?.email);
}

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
      include: {
        _count: {
          select: {
            payments: true,
            createdMedia: true,
            approvals: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const users = await Promise.all(
    dbUsers.map(async (user) => ({
      ...user,
      score: await calculateUserScore({ userId: user.id }),
    })),
  );

  return {
    users,
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
      include: { createdBy: true },
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

export async function calculateUserScore({
  userId,
  creatorWeights = {
    CampaignComment: 1,
    CampaignPayment: 5,
    CampaignUpdate: 3,
    ProfileCompleted: 2,
  },
  receiverWeights = {
    CampaignApprove: 10,
    CampaignDisable: -5,
    CampaignComment: 1,
    CampaignPayment: 1,
    CampaignUpdate: 0,
    CampaignShare: 2,
  },
}: {
  userId: number;
  creatorWeights?: Record<string, number>;
  receiverWeights?: Record<string, number>;
}) {
  try {
    const creatorTypes = Object.keys(creatorWeights);
    const receiverTypes = Object.keys(receiverWeights);
    const allTypes = Array.from(new Set([...creatorTypes, ...receiverTypes]));

    let creatorCaseParts: Prisma.Sql = Prisma.sql``;
    for (const type of allTypes) {
      if (creatorWeights[type] !== undefined) {
        creatorCaseParts = Prisma.sql`${creatorCaseParts}
          WHEN "createdById" = ${userId} AND "type" = ${type} THEN ${creatorWeights[type]}`;
      }
    }

    let receiverCaseParts: Prisma.Sql = Prisma.sql``;
    for (const type of allTypes) {
      if (receiverWeights[type] !== undefined) {
        receiverCaseParts = Prisma.sql`${receiverCaseParts}
          WHEN "receiverId" = ${userId} AND "type" = ${type} THEN ${receiverWeights[type]}`;
      }
    }

    const query = Prisma.sql`
      SELECT
        SUM(CASE
          ${creatorCaseParts}
          ELSE 0
        END) AS "creatorScore",
        SUM(CASE
          ${receiverCaseParts}
          ELSE 0
        END) AS "receiverScore"
      FROM
        "EventFeed"
      WHERE
        "createdById" = ${userId} OR "receiverId" = ${userId}
    `;
    const result =
      await db.$queryRaw<{ creatorScore: bigint; receiverScore: bigint }[]>(
        query,
      );
    if (result.length === 0) {
      return { creatorScore: 0, receiverScore: 0, totalScore: 0 };
    }

    const { creatorScore, receiverScore } = result[0];
    const creatorScoreNum = Number(creatorScore);
    const receiverScoreNum = Number(receiverScore);
    return {
      creatorScore: creatorScoreNum,
      receiverScore: receiverScoreNum,
      totalScore: creatorScoreNum + receiverScoreNum,
    };
  } catch (error) {
    console.error('Error calculating user score:', error);
    throw new Error('Failed to calculate user score');
  }
}

export async function getUserScoreEvents({
  userId,
  page = 1,
  pageSize = 10,
  category,
}: {
  userId: number;
  page?: number;
  pageSize?: number;
  category?: 'donor' | 'creator';
}) {
  // Validate pageSize
  if (pageSize > 100) {
    throw new Error('Maximum page size exceeded');
  }

  const skip = (page - 1) * pageSize;

  // Build where clause
  const where: Prisma.EventFeedWhereInput = {
    OR: [{ createdById: userId }, { receiverId: userId }],
  };

  // Filter by category if specified
  if (category) {
    if (category === 'donor') {
      // Donor events are when user created them
      where.createdById = userId;
    } else if (category === 'creator') {
      // Creator events are when user received them
      where.receiverId = userId;
    }
  }

  const totalItems = await db.eventFeed.count({ where });

  const events = await db.eventFeed.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
  });

  const scoreEvents = events
    .map((event) => {
      let points = 0;
      let action = '';
      let eventCategory = '';

      // Determine points based on event type and user role
      if (event.createdById === userId) {
        // User created this event (donor actions)
        switch (event.type) {
          case 'CampaignComment':
            points = 1;
            action = 'Commented on a campaign';
            eventCategory = 'donor';
            break;
          case 'CampaignPayment':
            points = 5;
            action = 'Made a donation';
            eventCategory = 'donor';
            break;
          case 'ProfileCompleted':
            points = 2;
            action = 'Completed profile';
            eventCategory = 'donor';
            break;
          case 'CampaignUpdate':
            points = 3;
            action = 'Updated campaign';
            eventCategory = 'creator';
            break;
        }
      } else if (event.receiverId === userId) {
        // User received this event (creator rewards)
        switch (event.type) {
          case 'CampaignApprove':
            points = 10;
            action = 'Campaign approved';
            eventCategory = 'creator';
            break;
          case 'CampaignDisable':
            points = -5;
            action = 'Campaign disabled';
            eventCategory = 'creator';
            break;
          case 'CampaignComment':
            points = 1;
            action = 'Received comment on campaign';
            eventCategory = 'creator';
            break;
          case 'CampaignPayment':
            points = 1;
            action = 'Received donation on campaign';
            eventCategory = 'creator';
            break;
          case 'CampaignShare':
            points = (event.data as { shareType?: string })?.shareType === 'donation' ? 5 : 2;
            action =
              (event.data as { shareType?: string })?.shareType === 'donation'
                ? 'Someone donated via your share link'
                : 'Someone signed up via your share link';
            eventCategory = 'creator';
            break;
        }
      }

      return {
        id: event.id,
        type: event.type,
        action,
        points,
        category: eventCategory,
        createdAt: event.createdAt.toISOString(),
        data: event.data,
      };
    })
    .filter((event) => event.points !== 0); // Only include events that give/take points

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasMore = page * pageSize < totalItems;

  return {
    events: scoreEvents,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalItems,
      hasMore,
    },
  };
}
