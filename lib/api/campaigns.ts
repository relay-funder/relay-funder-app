import { db, Prisma } from '@/server/db';
import type { Campaign, CampaignImage, Payment, User } from '@/server/db';
import { DbCampaign } from '@/types/campaign';
import { CampaignStatus } from '@/types/campaign';
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

export type PaymentWithUser = Payment & {
  user: User;
};

export type CampaignWithRelations = Campaign & {
  images: CampaignImage[];
  payments: PaymentWithUser[];
};

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
  const statusList = [CampaignStatus.ACTIVE];
  if (!admin) {
    if (creatorAddress) {
      // users may request all states for their own campaigns
      if (status === 'all') {
        statusList.push(
          CampaignStatus.DRAFT,
          CampaignStatus.PENDING_APPROVAL,
          CampaignStatus.COMPLETED,
          CampaignStatus.ACTIVE,
        );
      }
    }
  } else {
    if (status === 'all') {
      statusList.push(
        CampaignStatus.DRAFT,
        CampaignStatus.PENDING_APPROVAL,
        CampaignStatus.COMPLETED,
        CampaignStatus.ACTIVE,
      );
    } else {
      statusList.push(
        CampaignStatus.PENDING_APPROVAL,
        CampaignStatus.COMPLETED,
        CampaignStatus.ACTIVE,
      );
    }
  }
  const where = {
    status: {
      in: statusList,
    },
    // Admin can see all campaigns, regular users only see deployed campaigns in production
    ...(admin || process.env.NODE_ENV === 'development'
      ? {}
      : { transactionHash: { not: null } }),
    creatorAddress,
  };
  const [dbCampaigns, totalCount] = await Promise.all([
    db.campaign.findMany({
      where,
      include: {
        media: { where: { state: 'UPLOADED' } },
        RoundCampaigns: {
          include: {
            Round: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.campaign.count({
      where,
    }),
  ]);
  // Admin can see all campaigns, regular users only see deployed campaigns in production
  const filteredDbCampaigns =
    admin || process.env.NODE_ENV === 'development'
      ? dbCampaigns
      : dbCampaigns.filter((campaign) => campaign.transactionHash);

  const paymentSummaryList = await getPaymentSummaryList(
    filteredDbCampaigns.map(({ id }) => id),
  );
  const creatorList = await Promise.all(
    filteredDbCampaigns.map(({ creatorAddress }) =>
      getUserWithStates(creatorAddress),
    ),
  );

  const combinedCampaigns = filteredDbCampaigns
    .map((dbCampaign) => {
      return {
        ...dbCampaign,
        paymentSummary: paymentSummaryList[dbCampaign.id] ?? {},
        creator: creatorList.find(
          ({ address }) => address === dbCampaign.creatorAddress,
        ),
      };
    })
    .map((dbCampaign) => {
      if (rounds) {
        return mapCampaign({
          ...dbCampaign,
          rounds:
            dbCampaign.RoundCampaigns?.map(({ Round, status, id }) =>
              mapRound(Round, status, id),
            ) ?? [],
        });
      }
      return mapCampaign(dbCampaign);
    })
    .filter(Boolean);
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
// Prefetching homepage campaigns
// sets the default query key and requests the db-data
export async function prefetchCampaigns(queryClient: QueryClient) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'infinite', 'active', 10],
    initialPageParam: 1,
    queryFn: () => listCampaigns({ rounds: true }),
  });
}
// Prefetching campaign
// sets the default query key and requests the db-data
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
      const token = {};
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
export async function getCampaign(campaignIdOrSlug: string | number) {
  let where = undefined;
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
          comments: true, // { where: { deleted: false, reportCount: { lt: 5 } } },
          updates: true,
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
) {
  const campaign = await db.campaign.findUnique({ where: { id } });
  if (!campaign?.creatorAddress) {
    throw new ApiConflictError(
      'campaign without a creatorAddress cannot store campaignUpdate',
    );
  }
  await db.$transaction([
    db.campaignUpdate.create({
      data: {
        title: title,
        content: content,
        campaignId: campaign.id,
        creatorAddress: campaign?.creatorAddress,
      },
    }),
    db.campaign.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);
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
              WHEN "token" IN ('USD', 'USDC')
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
              WHEN "Payment"."token" IN ('USD', 'USDC')
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
