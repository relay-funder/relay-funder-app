// TODO: Break down large functions into smaller, focused utilities
// - Extract calculateUserScore SQL building logic into separate functions
// - Split getUserScoreEvents event mapping logic into dedicated mappers
// - Create reusable pagination utilities for list functions

import { db, type Payment, Prisma } from '@/server/db';
import { DisplayUserWithStates } from './types/user';
import { CREATOR_EVENT_POINTS, RECEIVER_EVENT_POINTS } from '@/lib/constant';
import { normalizeAddress } from '@/lib/normalize-address';

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
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return null;
  }

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

  let whereClause = Prisma.sql`TRUE`;
  if (type) {
    whereClause = Prisma.sql`${whereClause} AND "type" = ${type}`;
  }
  if (startDate) {
    whereClause = Prisma.sql`${whereClause} AND "createdAt" < ${new Date(startDate)}`;
  }
  if (endDate) {
    whereClause = Prisma.sql`${whereClause} AND "createdAt" > ${new Date(endDate)}`;
  }

  const countQuery = Prisma.sql`
    SELECT COUNT(*) as count
    FROM (
      SELECT 1
      FROM "EventFeed"
      WHERE ${whereClause}
      GROUP BY "eventUuid"
    ) AS grouped
  `;

  const totalResult = await db.$queryRaw<{ count: bigint }[]>(countQuery);
  const totalItems = Number(totalResult[0]?.count || 0);

  const eventsQuery = Prisma.sql`
    WITH grouped AS (
      SELECT
        "eventUuid",
        MAX("createdAt") AS max_created_at,
        (ARRAY_AGG(id ORDER BY "createdAt" DESC))[1] AS selected_id
      FROM "EventFeed"
      WHERE ${whereClause}
      GROUP BY "eventUuid"
    )
    SELECT ef.*, u.*
    FROM grouped g
    JOIN "EventFeed" ef ON ef.id = g.selected_id
    LEFT JOIN "User" u ON ef."createdById" = u.id
    ORDER BY g.max_created_at DESC
    LIMIT ${pageSize} OFFSET ${skip}
  `;

  const dbFeedEvents = await db.$queryRaw<
    Array<{
      id: number;
      createdAt: Date;
      createdById: number;
      receiverId: number;
      type: string;
      message: string;
      data: Prisma.JsonValue;
      eventUuid: string;
      // User fields
      address: string;
      rawAddress: string;
      updatedAt: Date;
      prevSigninAt: Date | null;
      lastSigninAt: Date | null;
      lastSignoutAt: Date | null;
      roles: string[];
      featureFlags: string[];
      crowdsplitCustomerId: string | null;
      email: string | null;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      bio: string | null;
      recipientWallet: string | null;
      humanityScore: number;
      collections: Prisma.JsonValue;
      payments: Prisma.JsonValue;
      paymentMethods: Prisma.JsonValue;
      createdMedia: Prisma.JsonValue;
      eventFeedRead: Date | null;
      withdrawals: Prisma.JsonValue;
      approvals: Prisma.JsonValue;
    }>
  >(eventsQuery);

  // Transform to match the expected structure
  const events = dbFeedEvents.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    createdById: row.createdById,
    receiverId: row.receiverId,
    type: row.type,
    message: row.message,
    data: row.data,
    eventUuid: row.eventUuid,
    createdBy: {
      id: row.createdById,
      address: row.address,
      rawAddress: row.rawAddress,
      updatedAt: row.updatedAt,
      prevSigninAt: row.prevSigninAt,
      lastSigninAt: row.lastSigninAt,
      lastSignoutAt: row.lastSignoutAt,
      roles: row.roles,
      featureFlags: row.featureFlags,
      crowdsplitCustomerId: row.crowdsplitCustomerId,
      email: row.email,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      bio: row.bio,
      recipientWallet: row.recipientWallet,
      humanityScore: row.humanityScore,
      collections: row.collections,
      payments: row.payments,
      paymentMethods: row.paymentMethods,
      createdMedia: row.createdMedia,
      eventFeedRead: row.eventFeedRead,
      withdrawals: row.withdrawals,
      approvals: row.approvals,
    },
  }));

  return {
    events,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      hasMore: skip + pageSize < totalItems,
    },
  };
}

function getPointsCaseSql(
  userId: number,
  weights: Record<string, number>,
  role: 'creator' | 'receiver',
): Prisma.Sql {
  let caseParts = Prisma.sql``;
  for (const [type, points] of Object.entries(weights)) {
    caseParts = Prisma.sql`${caseParts} WHEN "type" = ${type} THEN ${points}`;
  }
  if (role === 'creator') {
    return Prisma.sql`CASE WHEN "createdById" = ${userId} THEN (CASE ${caseParts} ELSE 0 END) ELSE 0 END`;
  } else {
    return Prisma.sql`CASE WHEN "receiverId" = ${userId} THEN (CASE ${caseParts} ELSE 0 END) ELSE 0 END`;
  }
}

export async function calculateUserScore({
  userId,
  creatorWeights = CREATOR_EVENT_POINTS,
  receiverWeights = RECEIVER_EVENT_POINTS,
}: {
  userId: number;
  creatorWeights?: Record<string, number>;
  receiverWeights?: Record<string, number>;
}) {
  try {
    const query = Prisma.sql`
      SELECT
        SUM(${getPointsCaseSql(userId, creatorWeights, 'creator')}) AS "creatorScore",
        SUM(${getPointsCaseSql(userId, receiverWeights, 'receiver')}) AS "receiverScore"
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

  let whereClause = Prisma.sql`"createdById" = ${userId} OR "receiverId" = ${userId}`;
  if (category === 'creator') {
    whereClause = Prisma.sql`"createdById" = ${userId}`;
  } else if (category === 'donor') {
    whereClause = Prisma.sql`"receiverId" = ${userId}`;
  }

  const countQuery = Prisma.sql`
    WITH scored_events AS (
      SELECT
        *,
        ${getPointsCaseSql(userId, CREATOR_EVENT_POINTS, 'creator')} + ${getPointsCaseSql(userId, RECEIVER_EVENT_POINTS, 'receiver')} AS points
      FROM "EventFeed"
      WHERE ${whereClause}
    ),
    grouped_events AS (
      SELECT
        "eventUuid",
        SUM(points) AS sum_points,
        MAX("createdAt") AS max_created_at
      FROM scored_events
      GROUP BY "eventUuid"
      HAVING SUM(points) > 0
    )
    SELECT COUNT(*) as count FROM grouped_events
  `;

  const totalResult = await db.$queryRaw<{ count: bigint }[]>(countQuery);
  const totalItems = Number(totalResult[0]?.count || 0);

  const eventsQuery = Prisma.sql`
    WITH scored_events AS (
      SELECT
        *,
        ${getPointsCaseSql(userId, CREATOR_EVENT_POINTS, 'creator')} + ${getPointsCaseSql(userId, RECEIVER_EVENT_POINTS, 'receiver')} AS points
      FROM "EventFeed"
      WHERE ${whereClause}
    ),
    grouped_events AS (
      SELECT
        "eventUuid",
        SUM(points) AS sum_points,
        MAX("createdAt") AS max_created_at
      FROM scored_events
      GROUP BY "eventUuid"
      HAVING SUM(points) > 0
    ),
    ranked_events AS (
      SELECT
        se.*,
        ge.sum_points,
        ge.max_created_at,
        ROW_NUMBER() OVER (PARTITION BY se."eventUuid" ORDER BY se.points DESC, se.id DESC) AS rn
      FROM scored_events se
      JOIN grouped_events ge ON se."eventUuid" = ge."eventUuid"
    )
    SELECT * FROM ranked_events WHERE rn = 1 ORDER BY max_created_at DESC LIMIT ${pageSize} OFFSET ${skip}
  `;

  const events = await db.$queryRaw<
    Array<{
      id: number;
      createdAt: Date;
      createdById: number;
      receiverId: number;
      type: string;
      message: string;
      data: Prisma.JsonValue;
      eventUuid: string;
      points: number;
      sum_points: number;
      max_created_at: Date;
      rn: number;
    }>
  >(eventsQuery);

  const scoreEvents = events
    .map((event) => {
      let points = 0;
      let action = '';
      let eventCategory = '';

      // Use the summed points from the query
      points = event.sum_points;

      // Determine action and category based on the representative event
      if (event.createdById === userId) {
        // User created this event (donor actions)
        switch (event.type) {
          case 'CampaignComment':
            action = 'Commented on a campaign';
            eventCategory = 'donor';
            break;
          case 'CampaignPayment':
            action = 'Made a donation';
            eventCategory = 'donor';
            break;
          case 'ProfileCompleted':
            action = 'Completed profile';
            eventCategory = 'donor';
            break;
          case 'CampaignUpdate':
            action = 'Updated campaign';
            eventCategory = 'creator';
            break;
        }
      } else if (event.receiverId === userId) {
        // User received this event (creator rewards)
        switch (event.type) {
          case 'CampaignApprove':
            action = 'Campaign approved';
            eventCategory = 'creator';
            break;
          case 'CampaignDisable':
            action = 'Campaign disabled';
            eventCategory = 'creator';
            break;
          case 'CampaignComment':
            action = 'Received comment on campaign';
            eventCategory = 'creator';
            break;
          case 'CampaignPayment':
            action = 'Received donation on campaign';
            eventCategory = 'creator';
            break;
          case 'CampaignShare':
            action = 'Someone used your share link';
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
