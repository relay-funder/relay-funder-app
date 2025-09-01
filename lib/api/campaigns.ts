import { db, Prisma } from '@/server/db';
import type { Campaign, CampaignImage, Payment, User } from '@/server/db';
import { DbCampaign } from '@/types/campaign';
import { CampaignStatus, CampaignCreatedEvent } from '@/types/campaign';
import { chainConfig, createPublicClient, http } from '@/lib/web3';
import { QueryClient } from '@tanstack/react-query';
import { CAMPAIGNS_QUERY_KEY } from '@/lib/hooks/useCampaigns';
import {
  GetCampaignPaymentSummary,
  GetCampaignResponseInstance,
  GetCampaignsStatsResponse,
} from './types';
import { getPaymentUser, getUserWithStates } from './user';
import { ApiConflictError } from './error';

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

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
interface IPublicClient {
  getLogs: (arg0: unknown) => Promise<unknown>;
}
async function getPublicClient(): Promise<IPublicClient> {
  const RPC_URL = chainConfig.rpcUrl;
  if (!FACTORY_ADDRESS || !RPC_URL) {
    throw new Error('Campaign factory address or RPC URL not configured');
  }

  return createPublicClient({
    chain: {
      ...chainConfig.defaultChain,
      contracts: {
        multicall3: {
          address: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
          blockCreated: 14353601,
        },
      },
    },
    transport: http(RPC_URL),
    batch: {
      multicall: {
        batchSize: 1024,
        wait: 16,
      },
    },
  }) as IPublicClient;
}

async function getCampaignCreatedEvents(client: IPublicClient) {
  return client.getLogs({
    address: FACTORY_ADDRESS as `0x${string}`,
    event: {
      type: 'event',
      name: 'CampaignInfoFactoryCampaignCreated',
      inputs: [
        { type: 'bytes32', name: 'identifierHash', indexed: true },
        { type: 'address', name: 'campaignInfoAddress', indexed: true },
      ],
    },
    fromBlock: 0n,
    toBlock: 'latest',
  });
}

function formatCampaignData(
  dbCampaign: DbCampaign,
  event: CampaignCreatedEvent | undefined,
  forceEvent = true,
) {
  if (forceEvent && (!event || !event.args)) {
    console.error('No matching event found for campaign:', {
      campaignId: dbCampaign.id,
      campaignAddress: dbCampaign.campaignAddress,
    });
    return null;
  }

  return {
    id: dbCampaign.id,
    campaignAddress: dbCampaign.campaignAddress,
    creatorAddress: dbCampaign.creatorAddress,
    title: dbCampaign.title,
    description: dbCampaign.description,
    status: dbCampaign.status,
    startTime: dbCampaign.startTime,
    endTime: dbCampaign.endTime,
    fundingGoal: dbCampaign.fundingGoal,
    // deprecated, remove:  8<
    address: dbCampaign.campaignAddress,
    owner: dbCampaign.creatorAddress,
    launchTime: Math.floor(
      new Date(dbCampaign.startTime).getTime() / 1000,
    ).toString(),
    deadline: Math.floor(
      new Date(dbCampaign.endTime).getTime() / 1000,
    ).toString(),
    goalAmount: dbCampaign.fundingGoal,
    // >8

    images: dbCampaign.images,
    slug: dbCampaign.slug,
    location: dbCampaign.location,
    category: dbCampaign.category,
    treasuryAddress: dbCampaign.treasuryAddress,
    paymentSummary: dbCampaign.paymentSummary,
    creator: dbCampaign.creator,
  };
}

export async function listCampaigns({
  admin = false,
  status = 'active',
  page = 1,
  pageSize = 10,
  rounds = false,
  skip = 0,
  forceEvents = false,
  creatorAddress,
}: {
  admin?: boolean;
  status?: string;
  page?: number;
  pageSize?: number;
  rounds?: boolean;
  skip?: number;
  forceEvents?: boolean;
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
    transactionHash: { not: null },
    creatorAddress,
  };
  console.log(where);
  const [dbCampaigns, totalCount] = await Promise.all([
    db.campaign.findMany({
      where,
      include: {
        images: true,
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
  const filteredDbCampaigns = dbCampaigns.filter(
    (campaign) => campaign.transactionHash,
  );

  const paymentSummaryList = await getPaymentSummaryList(
    filteredDbCampaigns.map(({ id }) => id),
  );
  const creatorList = await Promise.all(
    filteredDbCampaigns.map(({ creatorAddress }) =>
      getUserWithStates(creatorAddress),
    ),
  );

  let events: CampaignCreatedEvent[] = [];
  if (forceEvents) {
    const client = await getPublicClient();
    events = (await getCampaignCreatedEvents(client)) as CampaignCreatedEvent[];
  }
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
    .map((dbCampaign: DbCampaign) => {
      const event = events.find(
        (onChainCampaign) =>
          onChainCampaign.args?.campaignInfoAddress?.toLowerCase() ===
          dbCampaign.campaignAddress?.toLowerCase(),
      ) as CampaignCreatedEvent | undefined;
      if (rounds) {
        return formatCampaignData(
          {
            ...dbCampaign,
            status: dbCampaign.status,
            rounds:
              dbCampaign.RoundCampaigns?.map(({ Round }) => ({
                id: Round.id,
                title: Round.title,
              })) ?? [],
          },
          event,
          forceEvents,
        );
      }
      return formatCampaignData(dbCampaign, event, forceEvents);
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
    queryFn: () => listCampaigns({}),
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
  count: bigint;
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
  return db.$queryRaw(query) as Promise<PaymentTokenList>;
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
  return Number(
    paymentMap
      .filter(({ campaignId }) => campaignId === id)
      .reduce((accumulator, { count }) => accumulator + count, 0n),
  );
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
      images: {
        where: { isMainImage: true },
        take: 1,
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          comments: true, // { where: { deleted: false, reportCount: { lt: 5 } } },
          updates: true,
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
