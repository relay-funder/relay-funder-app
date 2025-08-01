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
}) {
  const statusList = !admin
    ? [CampaignStatus.ACTIVE]
    : status === 'active'
      ? [CampaignStatus.ACTIVE]
      : status === 'all'
        ? [
            CampaignStatus.DRAFT,
            CampaignStatus.PENDING_APPROVAL,
            CampaignStatus.COMPLETED,
            CampaignStatus.ACTIVE,
          ]
        : [
            CampaignStatus.PENDING_APPROVAL,
            CampaignStatus.COMPLETED,
            CampaignStatus.ACTIVE,
          ];
  const [dbCampaigns, totalCount] = await Promise.all([
    db.campaign.findMany({
      where: {
        status: {
          in: statusList,
        },
      },
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
      where: {
        status: {
          in: statusList,
        },
      },
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
          amount: Number(lastConfirmed?.amount ?? 0),
          token: lastConfirmed?.token,
          user: getPaymentUser(lastConfirmed),
          date: lastConfirmed?.updatedAt,
        }
      : null;
    paymentSummary.lastPending = lastPending
      ? {
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
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 10,
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
