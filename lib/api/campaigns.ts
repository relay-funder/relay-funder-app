import { db, Prisma } from '@/server/db';
import type {
  Campaign,
  CampaignImage,
  Payment,
  RoundCampaigns,
  User,
} from '@/server/db';
import { DbCampaign, CampaignStatus } from '@/types/campaign';
import { QueryClient } from '@tanstack/react-query';
import { CAMPAIGNS_QUERY_KEY } from '@/lib/hooks/useCampaigns';
import {
  GetCampaignPaymentSummary,
  GetCampaignResponseInstance,
  GetCampaignsStatsResponse,
} from './types';
import { getPaymentUser, getUserWithStates } from './user';
import { ApiConflictError } from './error';
import { mapRound } from './rounds';
import { JsonValue } from '@/.generated/prisma/client/runtime/library';
import { fileToUrl } from '@/lib/storage';

/**
 * Local types
 */
export type PaymentWithUser = Payment & {
  user: User;
};

export type CampaignWithRelations = Campaign & {
  images: CampaignImage[];
  payments: PaymentWithUser[];
  RoundCampaigns?: RoundCampaigns[];
};
export type CampaignWithRoundCampaigns = Prisma.CampaignGetPayload<{
  include: {
    media: { where: { state: 'UPLOADED' } };
    RoundCampaigns: { include: { Round: true } };
  };
}>;

/**
 * Shared helpers (DRY)
 */

// Build the list of statuses to query for based on status param and role
function buildStatusList({
  admin,
  status,
  creatorAddress,
}: {
  admin: boolean;
  status: string;
  creatorAddress?: string;
}) {
  const list: CampaignStatus[] = [CampaignStatus.ACTIVE];
  if (status === 'all') {
    if (!admin) {
      if (creatorAddress) {
        list.push(
          CampaignStatus.DRAFT,
          CampaignStatus.PENDING_APPROVAL,
          CampaignStatus.DISABLED,
          CampaignStatus.COMPLETED,
        );
      }
    } else {
      list.push(
        CampaignStatus.DRAFT,
        CampaignStatus.PENDING_APPROVAL,
        CampaignStatus.DISABLED,
        CampaignStatus.COMPLETED,
      );
    }
  }
  return list;
}

// Build base where clause for campaign listing
function buildCampaignWhere({
  admin,
  status,
  creatorAddress,
}: {
  admin: boolean;
  status: string;
  creatorAddress?: string;
}): Prisma.CampaignWhereInput {
  const statusList = buildStatusList({ admin, status, creatorAddress });

  // Apply transactionHash filter only for non-admin users in production when not including draft campaigns
  const shouldApplyTransactionFilter = !(
    admin ||
    process.env.NODE_ENV === 'development' ||
    statusList.includes(CampaignStatus.DRAFT)
  );

  return {
    status: { in: statusList },
    ...(shouldApplyTransactionFilter ? { transactionHash: { not: null } } : {}),
    creatorAddress,
  };
}

// Base include for campaigns list queries
function buildCampaignInclude(rounds: boolean) {
  const base: Prisma.CampaignInclude = {
    media: { where: { state: 'UPLOADED' } },
    RoundCampaigns: {
      include: { Round: true },
    },
  };
  if (!rounds) {
    return base;
  }
  // when rounds is required, the mapping happens later, but we need the round relation
  return base;
}

// Execute DB query (findMany + count) with custom order
async function queryCampaigns({
  where,
  skip,
  take,
  orderBy,
  rounds,
}: {
  where: Prisma.CampaignWhereInput;
  skip: number;
  take: number;
  orderBy:
    | Prisma.CampaignOrderByWithRelationInput
    | Prisma.CampaignOrderByWithRelationInput[];
  rounds: boolean;
}): Promise<{ rows: CampaignWithRoundCampaigns[]; totalCount: number }> {
  const [rows, totalCount] = await Promise.all([
    db.campaign.findMany({
      where,
      include: buildCampaignInclude(rounds),
      skip,
      take,
      orderBy,
    }),
    db.campaign.count({ where }),
  ]);
  return { rows: rows as unknown as CampaignWithRoundCampaigns[], totalCount };
}

// Enrich campaigns with creator and payment summaries and map to DbCampaign
async function combineCampaigns({
  dbCampaigns,
  rounds,
}: {
  dbCampaigns: CampaignWithRoundCampaigns[];
  rounds: boolean;
}) {
  // Compute payment summaries for listed IDs
  const paymentSummaryList = await getPaymentSummaryList(
    dbCampaigns.map(({ id }) => id),
  );
  // Fetch creators
  const creators = await Promise.all(
    dbCampaigns.map(({ creatorAddress }) => getUserWithStates(creatorAddress)),
  );

  // Combine and map
  const combined = dbCampaigns
    .map((campaign) => {
      return {
        ...campaign,
        paymentSummary: paymentSummaryList[campaign.id] ?? {},
        creator: creators.find(
          ({ address }) => address === campaign.creatorAddress,
        ),
      };
    })
    .map((campaign) => {
      if (rounds) {
        return mapCampaign({
          ...campaign,
          rounds:
            campaign.RoundCampaigns?.map(({ Round, status, id }) =>
              mapRound(Round, status, id),
            ) ?? [],
        });
      }
      return mapCampaign(campaign);
    })
    .filter(Boolean) as DbCampaign[];

  return combined;
}

/**
 * Public query surfaces
 */

// Homepage ordering: feature-first (by featuredStart asc so NOT NULL first), then newest
const HOMEPAGE_ORDER: Prisma.CampaignOrderByWithRelationInput[] = [
  { featuredStart: 'asc' },
  { createdAt: 'desc' },
];

// Admin ordering: plain recency, do NOT use the featured index
const ADMIN_ORDER: Prisma.CampaignOrderByWithRelationInput[] = [
  { createdAt: 'desc' },
];

// Generalized list that chooses ordering based on admin flag
export async function listCampaigns({
  admin = false,
  status = 'active',
  page = 1,
  pageSize = 10,
  rounds = false,
  skip = 0,
  creatorAddress,
}: {
  admin?: boolean;
  status?: string;
  page?: number;
  pageSize?: number;
  rounds?: boolean;
  skip?: number;
  creatorAddress?: string;
}) {
  const where = buildCampaignWhere({ admin, status, creatorAddress });
  const orderBy = admin ? ADMIN_ORDER : HOMEPAGE_ORDER;

  const { rows, totalCount } = await queryCampaigns({
    where,
    skip,
    take: pageSize,
    orderBy,
    rounds,
  });

  const combinedCampaigns = await combineCampaigns({
    dbCampaigns: rows,
    rounds,
  });

  return {
    campaigns: combinedCampaigns,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}

// Explicit surfaces if you want to call them separately elsewhere
export async function listHomepageCampaigns(
  args: Omit<Parameters<typeof listCampaigns>[0], 'admin'>,
) {
  return listCampaigns({ ...args, admin: false });
}
export async function listAdminCampaigns(
  args: Omit<Parameters<typeof listCampaigns>[0], 'admin'>,
) {
  return listCampaigns({ ...args, admin: true });
}

/**
 * Single campaign lookups and helpers
 */
export async function getCampaignBySlug(
  slug: string,
): Promise<CampaignWithRelations | null> {
  try {
    const campaign = await db.campaign.findUnique({
      where: { slug },
      include: {
        images: true,
        payments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!campaign) {
      return null;
    }
    return campaign;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

// Prefetching homepage campaigns (infinite)
export async function prefetchCampaigns(queryClient: QueryClient) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'infinite', 'active', 10],
    initialPageParam: 1,
    queryFn: () => listCampaigns({ rounds: true }),
  });
}

// Prefetching single campaign
export async function prefetchCampaign(queryClient: QueryClient, slug: string) {
  return queryClient.prefetchQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, slug],
    queryFn: async () => ({
      campaign: await getCampaign(slug),
    }),
  });
}

type PaymentTokenList = {
  campaignId: number;
  token: string;
  amount: number;
  count: number;
}[];

export async function getPaymentMap(idList: number[], confirmed: boolean) {
  const query = Prisma.sql`
      SELECT
          "campaignId",
          "token",
          SUM(CAST("amount" AS DECIMAL)) AS amount,
          COUNT("id") as count
      FROM
          "Payment"
      WHERE
          "type" = 'BUY'
          AND
          "status" in (${confirmed ? Prisma.sql`'confirmed'` : Prisma.sql`'pending','confirming'`})
          AND
          "campaignId" in (${Prisma.join(idList)})
      GROUP BY
          "campaignId",
          "token"
      ORDER BY
          "campaignId"
      ;
        `;
  const results = (await db.$queryRaw(query)) as Array<{
    campaignId: number;
    token: string;
    amount: number;
    count: bigint;
  }>;

  // Convert BigInt count values to numbers to avoid JSON serialization errors
  return results.map((result) => ({
    ...result,
    count: Number(result.count),
  })) as PaymentTokenList;
}

export function getEmptyPaymentSummary(): GetCampaignPaymentSummary {
  return {
    lastConfirmed: null,
    lastPending: null,
    countConfirmed: 0,
    countPending: 0,
  };
}

type PaymentTokenMap = Record<string, { pending: number; confirmed: number }>;

export function summarizePaymentMap(
  id: number,
  tokenMapRef: PaymentTokenMap,
  paymentMap: PaymentTokenList,
  destination: 'pending' | 'confirmed',
) {
  for (const { token, amount } of paymentMap.filter(
    ({ campaignId }) => campaignId === id,
  )) {
    if (!tokenMapRef[token]) {
      tokenMapRef[token] = { pending: 0, confirmed: 0 };
    }
    const nAmount = Number(amount);
    if (!isNaN(nAmount)) {
      tokenMapRef[token][destination] = nAmount;
    }
  }
}

export function countPaymentMap(id: number, paymentMap: PaymentTokenList) {
  return paymentMap
    .filter(({ campaignId }) => campaignId === id)
    .reduce((accumulator, { count }) => accumulator + count, 0);
}

export async function getPaymentSummaryList(idList: number[]) {
  const paymentSummaryList: Record<number, GetCampaignPaymentSummary> = {};
  try {
    const [pending, confirmed] = await Promise.all([
      getPaymentMap(idList, false),
      getPaymentMap(idList, true),
    ]);
    for (const id of idList) {
      if (typeof paymentSummaryList[id] === 'undefined') {
        paymentSummaryList[id] = getEmptyPaymentSummary();
      }
      const token: PaymentTokenMap = {};
      summarizePaymentMap(id, token, pending, 'pending');
      summarizePaymentMap(id, token, confirmed, 'confirmed');
      paymentSummaryList[id].token = token;
      paymentSummaryList[id].countConfirmed = countPaymentMap(id, confirmed);
      paymentSummaryList[id].countPending = countPaymentMap(id, pending);
    }
  } catch {}
  return paymentSummaryList;
}

export async function getPaymentSummary(id: number) {
  const paymentSummaryList = await getPaymentSummaryList([id]);
  const paymentSummary = paymentSummaryList[id];
  if (!paymentSummary) {
    return getEmptyPaymentSummary();
  }
  try {
    const [lastConfirmed, lastPending] = await Promise.all([
      db.payment.findFirst({
        where: { campaignId: id, status: 'confirmed', type: 'BUY' },
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              lastName: true,
              firstName: true,
              address: true,
            },
          },
        },
      }),
      db.payment.findFirst({
        where: {
          campaignId: id,
          status: { in: ['pending', 'confirming'] },
          type: 'BUY',
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              lastName: true,
              firstName: true,
              address: true,
            },
          },
        },
      }),
    ]);

    paymentSummary.lastConfirmed = lastConfirmed
      ? {
          id: lastConfirmed.id,
          status: lastConfirmed.status,
          amount: Number(lastConfirmed?.amount ?? 0),
          token: lastConfirmed?.token,
          user: getPaymentUser(lastConfirmed),
          date: lastConfirmed?.updatedAt,
        }
      : null;
    paymentSummary.lastPending = lastPending
      ? {
          id: lastPending.id,
          status: lastPending.status,
          amount: Number(lastPending?.amount ?? 0),
          token: lastPending?.token,
          user: getPaymentUser(lastPending),
          date: lastPending?.updatedAt,
        }
      : null;
  } catch {}
  return paymentSummary;
}

/**
 * Lightweight campaign fetch for payment creation
 * Only fetches essential fields needed for validation
 */
export async function getCampaignForPayment(campaignId: number) {
  const instance = await db.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      title: true,
      creatorAddress: true,
      // Only fetch round IDs and dates for round contribution creation
      RoundCampaigns: {
        select: {
          id: true,
          status: true,
          Round: {
            select: {
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  if (!instance) {
    return null;
  }

  // Map to minimal format for round contribution logic
  return {
    ...instance,
    rounds: instance.RoundCampaigns.map((rc) => ({
      roundCampaignId: rc.id,
      status: rc.status,
      startTime: rc.Round.startDate,
      endTime: rc.Round.endDate,
    })),
  };
}

export async function getCampaign(campaignIdOrSlug: string | number) {
  let where = undefined as Prisma.CampaignWhereUniqueInput | undefined;
  if (!isNaN(Number(campaignIdOrSlug))) {
    where = { id: Number(campaignIdOrSlug) };
  } else {
    where = { slug: campaignIdOrSlug as string };
  }
  const instance = await db.campaign.findUnique({
    where,
    include: {
      media: { where: { state: 'UPLOADED' } },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      RoundCampaigns: {
        include: {
          Round: {
            include: {
              media: { where: { state: 'UPLOADED' } },
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          updates: { where: { isHidden: false } },
          RoundCampaigns: true,
        },
      },
    },
  });
  if (!instance) {
    return null;
  }
  const creator = await getUserWithStates(instance.creatorAddress);
  const paymentSummary = await getPaymentSummary(instance.id);

  return {
    ...instance,
    RoundCampaigns: undefined,
    rounds: instance.RoundCampaigns.map((roundCampaign) =>
      mapRound(roundCampaign.Round, roundCampaign.status, roundCampaign.id),
    ),
    _count: {
      ...instance._count,
      RoundCampaign: undefined,
      rounds: instance._count.RoundCampaigns,
    },
    creator,
    paymentSummary,
  } as GetCampaignResponseInstance;
}

export async function addCampaignUpdate(
  id: number,
  title: string,
  content: string,
  media?: File[],
  userId?: number,
) {
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign?.creatorAddress) {
    throw new ApiConflictError(
      'campaign without a creatorAddress cannot store campaignUpdate',
    );
  }

  const update = await db.campaignUpdate.create({
    data: {
      title,
      content,
      campaignId: campaign.id,
      creatorAddress: campaign.creatorAddress,
    },
  });

  // Handle media uploads
  if (media && media.length > 0 && userId) {
    const mediaUrls = [];
    for (const file of media) {
      try {
        const url = await fileToUrl(file);

        const mediaRecord = await db.media.create({
          data: {
            url,
            mimeType: file.type,
            state: 'UPLOADED',
            update: { connect: { id: update.id } },
            createdBy: { connect: { id: userId } },
          },
        });
        mediaUrls.push(mediaRecord.id);
      } catch (error) {
        console.error('Error uploading media file:', error);
        // Skip failed uploads
      }
    }
    if (mediaUrls.length > 0) {
      await db.campaignUpdate.update({
        where: { id: update.id },
        data: {
          mediaOrder: mediaUrls,
        },
      });
    }
  }

  await db.campaign.update({ where: { id }, data: { updatedAt: new Date() } });

  return update;
}

export async function toggleHideCampaignUpdate(
  campaignId: number,
  updateId: number,
) {
  const currentUpdate = await db.campaignUpdate.findUniqueOrThrow({
    where: { id: updateId },
  });
  const updatedUpdate = await db.campaignUpdate.update({
    where: { id: updateId },
    data: { isHidden: !currentUpdate.isHidden },
  });

  await db.campaign.update({
    where: { id: campaignId },
    data: { updatedAt: new Date() },
  });

  return updatedUpdate;
}

export async function addCampaignComment(
  id: number,
  content: string,
  address: string,
) {
  await db.$transaction([
    db.comment.create({
      data: {
        content,
        campaignId: id,
        userAddress: address,
      },
    }),
    db.campaign.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);
}

export async function getStats({
  creatorAddress,
  admin,
}: {
  creatorAddress: string;
  admin: boolean;
}) {
  const stats: GetCampaignsStatsResponse = {
    totalCampaigns: 0,
    totalRaised: 0,
    activeCampaigns: 0,
    averageProgress: 0,
  };

  if (admin) {
    stats.totalCampaigns = await db.campaign.count();
    stats.activeCampaigns = await db.campaign.count({
      where: { status: 'ACTIVE' },
    });
    const raisedQuery = Prisma.sql`
      WITH TotalRaised AS (
        SELECT
          "campaignId",
          SUM(
            CASE
              WHEN "token" IN ('USD', 'USDC', 'USDT')
                    AND "type" = 'BUY'
                    AND "status" = 'confirmed'
                    THEN
                    "amount"::numeric
              ELSE 0
            END
          ) AS total_raised
        FROM
          "Payment"
        GROUP BY
          "campaignId"
      ),
      CampaignProgress AS (
        SELECT
          "Campaign".id AS campaign_id,
          "Campaign"."fundingGoal"::numeric,
          COALESCE(TotalRaised.total_raised, 0) AS total_raised
        FROM
          "Campaign"
        LEFT JOIN
          TotalRaised ON "Campaign".id = TotalRaised."campaignId"
        WHERE
          "Campaign"."status" in ('ACTIVE', 'COMPLETED')
      )
      SELECT
        SUM(total_raised) AS total_raised,
        AVG(total_raised / "fundingGoal") AS average_progress
      FROM
        CampaignProgress
      ;`;
    const raised = (await db.$queryRaw(raisedQuery)) as {
      total_raised: string;
      average_progress: string;
    }[];
    if (raised.length === 1) {
      stats.totalRaised = parseFloat(raised[0].total_raised);
      stats.averageProgress = parseFloat(raised[0].average_progress);
    }
  } else {
    stats.totalCampaigns = await db.campaign.count({
      where: { creatorAddress },
    });
    stats.activeCampaigns = await db.campaign.count({
      where: { creatorAddress, status: 'ACTIVE' },
    });
    const raisedQuery = Prisma.sql`
      WITH TotalRaised AS (
        SELECT
          "Campaign"."id" AS "campaignId",
          SUM(
            CASE
              WHEN "Payment"."token" IN ('USD', 'USDC', 'USDT')
                    AND "Payment"."type" = 'BUY'
                    AND "Payment"."status" = 'confirmed'
                    THEN
                    "Payment"."amount"::numeric
              ELSE 0
            END
            ) AS total_raised
        FROM
          "Campaign"
            INNER JOIN "Payment"
            ON "Payment"."campaignId" = "Campaign"."id"
        WHERE
          "Campaign"."creatorAddress" = ${creatorAddress}
        GROUP BY
          "Campaign"."id"
      ),
      CampaignProgress AS (
        SELECT
          "Campaign".id AS campaign_id,
          "Campaign"."fundingGoal"::numeric,
          COALESCE(TotalRaised.total_raised, 0) AS total_raised
        FROM
          "Campaign"
            LEFT JOIN
          TotalRaised
            ON "Campaign".id = TotalRaised."campaignId"
        WHERE
            "Campaign"."creatorAddress" = ${creatorAddress}
          AND
            "Campaign"."status" in ('ACTIVE', 'COMPLETED')
      )
      SELECT
        SUM(total_raised) AS total_raised,
        AVG(total_raised / "fundingGoal") AS average_progress
      FROM
        CampaignProgress
      ;`;
    const raised = (await db.$queryRaw(raisedQuery)) as {
      total_raised: string;
      average_progress: string;
    }[];
    if (raised.length === 1) {
      stats.totalRaised = parseFloat(raised[0].total_raised);
      stats.averageProgress = parseFloat(raised[0].average_progress);
    }
  }
  if (isNaN(stats.totalRaised)) {
    stats.totalRaised = 0;
  }
  if (isNaN(stats.averageProgress)) {
    stats.averageProgress = 0;
  }
  return stats;
}

interface MapCampaignInput extends Omit<DbCampaign, 'mediaOrder'> {
  RoundCampaigns?: unknown;
  mediaOrder?: JsonValue | string[] | null;
}
export function mapCampaign(dbCampaign: MapCampaignInput): DbCampaign {
  const { RoundCampaigns, ...dbCampaignWithoutDbData } = dbCampaign;
  if (RoundCampaigns) {
    // pass
  }
  return {
    ...dbCampaignWithoutDbData,
    mediaOrder: Array.isArray(dbCampaign.mediaOrder)
      ? (dbCampaign.mediaOrder as string[])
      : [],
  };
}

/**
 * Update campaign with transaction hash and campaign address
 */
export async function updateCampaignTransaction({
  id,
  transactionHash,
  campaignAddress,
}: {
  id: number;
  transactionHash: string;
  campaignAddress?: string;
}) {
  return await db.campaign.update({
    where: { id },
    data: {
      transactionHash,
      campaignAddress: campaignAddress ?? undefined,
    },
  });
}
