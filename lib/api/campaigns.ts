import { db } from '@/server/db';
import type { Campaign, CampaignImage, Payment, User } from '@/server/db';
import { DbCampaign } from '@/types/campaign';
import { CampaignStatus, CampaignCreatedEvent } from '@/types/campaign';
import { chainConfig, createPublicClient, http } from '@/lib/web3';
import { QueryClient } from '@tanstack/react-query';
import { CAMPAIGNS_QUERY_KEY } from '@/lib/hooks/useCampaigns';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CAMPAIGN_INFO_FACTORY;
const RPC_URL = chainConfig.rpcUrl;

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

async function getPublicClient() {
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
  });
}

async function getCampaignCreatedEvents(
  client: ReturnType<typeof createPublicClient>,
) {
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
    title: dbCampaign.title,
    description: dbCampaign.description,
    status: dbCampaign.status,
    address: dbCampaign.campaignAddress,
    owner: dbCampaign.creatorAddress,
    launchTime: Math.floor(
      new Date(dbCampaign.startTime).getTime() / 1000,
    ).toString(),
    deadline: Math.floor(
      new Date(dbCampaign.endTime).getTime() / 1000,
    ).toString(),
    goalAmount: dbCampaign.fundingGoal,
    totalRaised:
      dbCampaign.payments?.reduce((accumulator, payment) => {
        const value = Number(payment.amount);
        if (isNaN(value)) {
          return accumulator;
        }
        return accumulator + value;
      }, 0) ?? 0,
    images: dbCampaign.images,
    slug: dbCampaign.slug,
    location: dbCampaign.location,
    category: dbCampaign.category,
    treasuryAddress: dbCampaign.treasuryAddress,
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
        payments: {
          // requires amount to be numeric: _sum: { amount: true },
          where: { token: 'USDC', type: 'BUY', status: 'confirmed' },
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
  let events: CampaignCreatedEvent[] = [];
  if (forceEvents) {
    const client = await getPublicClient();
    // @ts-expect-error - client issue
    events = await getCampaignCreatedEvents(client);
  }
  const combinedCampaigns = dbCampaigns
    .filter((campaign) => campaign.transactionHash)
    .map((dbCampaign) => {
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
