import { Campaign, db, Media, Round, RoundCampaigns } from '@/server/db';
import {
  GetRoundResponseInstance,
  GetRoundsStatsResponse,
} from './types/rounds';
import type { GetCampaignPaymentSummary } from './types/campaigns';
import { ROUND_QUERY_KEY, ROUNDS_QUERY_KEY } from '../hooks/useRounds';
import { QueryClient } from '@tanstack/react-query';
import { ApiNotFoundError } from './error';
import { getEmptyPaymentSummary, mapCampaign } from './campaigns';
import { isFuture, isPast } from 'date-fns';

const ROUND_CAMPAIGN_PAYMENT_STATUSES = [
  'confirmed',
  'pending',
  'confirming',
  'CONFIRMED',
  'PENDING',
  'CONFIRMING',
] as const;

const ANONYM_ADDRESS = '0x00000000000000000000000000000000';

type RoundCampaignPayment = {
  id: number;
  status: string;
  amount: number | string;
  token: string | null;
  updatedAt: Date;
  isAnonymous: boolean;
  user: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    address: string;
  } | null;
};

function getPaymentBucket(status: string): 'confirmed' | 'pending' | null {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === 'confirmed') {
    return 'confirmed';
  }
  if (normalizedStatus === 'pending' || normalizedStatus === 'confirming') {
    return 'pending';
  }

  return null;
}

function getPaymentDisplayUser(payment: RoundCampaignPayment) {
  if (payment.isAnonymous) {
    return {
      name: 'Anonym',
      address: ANONYM_ADDRESS,
    };
  }

  return {
    name: payment.user?.username ?? payment.user?.firstName ?? null,
    address: payment.user?.address ?? null,
  };
}

function buildPaymentSummaryFromPayments(
  payments: RoundCampaignPayment[] | undefined,
): GetCampaignPaymentSummary {
  const paymentSummary = getEmptyPaymentSummary();

  if (!payments?.length) {
    return paymentSummary;
  }

  const tokenSummary: NonNullable<GetCampaignPaymentSummary['token']> = {};

  for (const payment of payments) {
    const bucket = getPaymentBucket(payment.status);

    if (!bucket) {
      continue;
    }

    if (bucket === 'confirmed') {
      paymentSummary.countConfirmed += 1;
    } else {
      paymentSummary.countPending += 1;
    }

    if (payment.token) {
      tokenSummary[payment.token] ??= { pending: 0, confirmed: 0 };

      const amount = Number(payment.amount ?? 0);
      if (!Number.isNaN(amount)) {
        tokenSummary[payment.token][bucket] += amount;
      }
    }

    const paymentContribution = {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount ?? 0),
      token: payment.token,
      user: getPaymentDisplayUser(payment),
      date: payment.updatedAt,
    };

    if (
      bucket === 'confirmed' &&
      (!paymentSummary.lastConfirmed ||
        payment.updatedAt > paymentSummary.lastConfirmed.date!)
    ) {
      paymentSummary.lastConfirmed = paymentContribution;
    }

    if (
      bucket === 'pending' &&
      (!paymentSummary.lastPending ||
        payment.updatedAt > paymentSummary.lastPending.date!)
    ) {
      paymentSummary.lastPending = paymentContribution;
    }
  }

  if (Object.keys(tokenSummary).length > 0) {
    paymentSummary.token = tokenSummary;
  }

  return paymentSummary;
}

function addRoundPaymentSummaries<
  TRound extends {
    roundCampaigns?: Array<{
      campaignId: number;
      Campaign:
        | ({
            payments?: RoundCampaignPayment[];
          } & Campaign)
        | null;
    }>;
  },
>(round: TRound): TRound {
  return {
    ...round,
    roundCampaigns: round.roundCampaigns?.map((roundCampaign) => ({
      ...roundCampaign,
      Campaign: roundCampaign.Campaign
        ? {
            ...roundCampaign.Campaign,
            paymentSummary: buildPaymentSummaryFromPayments(
              roundCampaign.Campaign.payments,
            ),
          }
        : roundCampaign.Campaign,
    })),
  };
}

export function mapRound(
  round: Round & {
    roundCampaigns?: (RoundCampaigns & {
      Campaign: Campaign & { paymentSummary?: GetCampaignPaymentSummary };
    })[];
    media?: Media[];
  },
  status?: 'PENDING' | 'APPROVED' | 'REJECTED',
  roundCampaignId?: number,
): GetRoundResponseInstance {
  const {
    startDate,
    endDate,
    applicationStart,
    applicationClose,
    poolId,
    logoUrl,
    isHidden,
    ...roundWithoutDeprecated
  } = round;
  return {
    ...roundWithoutDeprecated,
    descriptionUrl: round.descriptionUrl ?? null,
    isHidden,
    // hydration conversion Decimal->Number and BigInt->Number
    matchingPool: Number(round.matchingPool),
    poolId: poolId ? Number(poolId) : null,
    // map future field names
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    applicationStartTime: applicationStart.toISOString(),
    applicationEndTime: applicationClose.toISOString(),
    updatedAt: round.updatedAt.toISOString(),
    createdAt: round.createdAt.toISOString(),
    roundCampaigns:
      round.roundCampaigns?.map((roundCampaign) => ({
        ...roundCampaign,
        reviewedAt: roundCampaign.reviewedAt?.toISOString() ?? null,
        campaign: roundCampaign.Campaign
          ? {
              ...mapCampaign(roundCampaign.Campaign),
              // Preserve payment summary if it exists
              ...(roundCampaign.Campaign.paymentSummary && {
                paymentSummary: roundCampaign.Campaign.paymentSummary,
              }),
            }
          : undefined,
      })) ?? [],
    media:
      Array.isArray(round.media) && round.media.length
        ? round.media
        : [
            {
              id: 'unknown',
              url: logoUrl as string,
              mimeType: 'image/unknown',
              caption: null,
            },
          ],
    mediaOrder: round.mediaOrder ? (round.mediaOrder as string[]) : [],
    // transient
    recipientStatus: status,
    roundCampaignId: roundCampaignId,
  };
}
export async function listRounds({
  page = 1,
  pageSize = 10,
  skip = 0,
  admin = false,
  userAddress = null,
  upcomingOnly = false,
}: {
  page?: number;
  pageSize?: number;
  skip?: number;
  admin?: boolean;
  userAddress?: string | null;
  upcomingOnly?: boolean;
}) {
  const filterStartTime = upcomingOnly
    ? { applicationClose: { gt: new Date() } }
    : {};
  const where = admin
    ? { ...filterStartTime }
    : { isHidden: false, ...filterStartTime }; // Exclude hidden rounds for non-admins

  const [rounds, totalCount] = await Promise.all([
    db.round.findMany({
      skip,
      where,
      include: {
        media: { where: { state: 'UPLOADED' } },
        roundCampaigns: {
          include: {
            Campaign: {
              include: {
                images: true,
                media: { where: { state: 'UPLOADED' } },
                payments: {
                  include: {
                    user: true,
                  },
                  where: {
                    status: {
                      in: [...ROUND_CAMPAIGN_PAYMENT_STATUSES],
                    },
                  },
                },
              },
            },
          },
          where: admin
            ? {} // Admin sees all campaigns
            : userAddress
              ? {
                  AND: [
                    // Exclude hidden rounds for non-admins
                    { Round: { isHidden: false } },
                    {
                      OR: [
                        // Include approved campaigns
                        {
                          status: 'APPROVED',
                          Campaign: {
                            status: {
                              in: ['ACTIVE', 'COMPLETED', 'FAILED'],
                            },
                          },
                        },
                        // Include user's own campaigns (any status)
                        {
                          Campaign: {
                            creatorAddress: userAddress,
                            status: {
                              in: [
                                'ACTIVE',
                                'COMPLETED',
                                'FAILED',
                                'PENDING_APPROVAL',
                              ],
                            },
                          },
                        },
                      ],
                    },
                  ],
                }
              : {
                  AND: [
                    // Exclude hidden rounds for non-admins
                    { Round: { isHidden: false } },
                    {
                      // Non-authenticated users see only approved campaigns
                      status: 'APPROVED',
                      Campaign: {
                        status: {
                          in: ['ACTIVE', 'COMPLETED', 'FAILED'],
                        },
                      },
                    },
                  ],
                },
        },
      },
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.round.count({
      where,
    }),
  ]);

  return {
    rounds: rounds.map((round) => mapRound(addRoundPaymentSummaries(round))),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
}

export async function getRound(
  id: number,
  admin: boolean | undefined = false,
  sessionAddress: string | null | undefined = null,
) {
  const round = await db.round.findUnique({
    where: { id },
    include: {
      media: { where: { state: 'UPLOADED' } },
      roundCampaigns: {
        include: {
          Campaign: {
            include: {
              images: true,
              media: { where: { state: 'UPLOADED' } },
              payments: {
                include: {
                  user: true,
                },
                where: {
                  status: {
                    in: [...ROUND_CAMPAIGN_PAYMENT_STATUSES],
                  },
                },
              },
            },
          },
        },
        where: admin
          ? {}
          : sessionAddress
            ? {
                AND: [
                  // Exclude hidden rounds for non-admins
                  { Round: { isHidden: false } },
                  {
                    OR: [
                      // Include approved campaigns with active status
                      {
                        status: 'APPROVED',
                        Campaign: {
                          status: {
                            in: ['ACTIVE', 'COMPLETED', 'FAILED'],
                          },
                        },
                      },
                      // Include user's own campaigns (any status)
                      {
                        Campaign: { creatorAddress: sessionAddress },
                      },
                    ],
                  },
                ],
              }
            : {
                AND: [
                  // Exclude hidden rounds for non-admins
                  { Round: { isHidden: false } },
                  {
                    // Non-authenticated users see only approved campaigns
                    status: 'APPROVED',
                    Campaign: {
                      status: {
                        in: ['ACTIVE', 'COMPLETED', 'FAILED'],
                      },
                    },
                  },
                ],
              },
      },
    },
  });

  if (!round) {
    throw new ApiNotFoundError(`Round with id ${id} does not exist`);
  }

  return mapRound(addRoundPaymentSummaries(round));
}
export async function getStats() {
  const stats: GetRoundsStatsResponse = {
    totalRounds: 0,
    totalRaised: 0,
    activeRounds: 0,
    averageProgress: 0,
  };

  stats.totalRounds = await db.round.count();
  stats.activeRounds = await db.round.count({
    where: { endDate: { gt: new Date() } },
  });
  return stats;
}

// Prefetching homepage rounds
// sets the default query key and requests the db-data
export async function prefetchRounds(
  queryClient: QueryClient,
  admin: boolean = false,
) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: [ROUNDS_QUERY_KEY, 'infinite', 'active', 10],
    initialPageParam: 1,
    queryFn: () => listRounds({ admin }),
  });
}
// Prefetching round
// sets the default query key and requests the db-data
export async function prefetchRound(
  queryClient: QueryClient,
  id: number,
  admin: boolean = false,
  sessionAddress: string | null = null,
) {
  return queryClient.prefetchQuery({
    queryKey: [ROUND_QUERY_KEY, id],
    queryFn: async () => ({
      round: await getRound(id, admin, sessionAddress),
    }),
  });
}

// Prefetch the active round for homepage
export async function prefetchActiveRound(queryClient: QueryClient) {
  // Use the same logic as the API endpoint - date-based, not status-based
  const now = new Date();
  const activeRound = await db.round.findFirst({
    where: {
      isHidden: false, // Exclude hidden rounds
      startDate: {
        lte: now, // Round has started
      },
      endDate: {
        gt: now, // Round hasn't ended
      },
    },
    include: {
      media: { where: { state: 'UPLOADED' } },
      _count: {
        select: {
          roundCampaigns: {
            where: {
              status: 'APPROVED',
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return queryClient.prefetchQuery({
    queryKey: [ROUNDS_QUERY_KEY, 'active'],
    queryFn: async () => (activeRound ? mapRound(activeRound) : null),
  });
}

export async function prefetchUpcomingRound(queryClient: QueryClient) {
  const upcomingRound = await getUpcomingRound();

  return queryClient.prefetchQuery({
    queryKey: [ROUNDS_QUERY_KEY, 'upcoming'],
    queryFn: async () => (upcomingRound ? mapRound(upcomingRound) : null),
  });
}

export function roundIsActive(round: GetRoundResponseInstance) {
  if (typeof round.recipientStatus !== 'number') {
    return false;
  }
  if (round.recipientStatus !== 'APPROVED') {
    return false;
  }
  if (!round.startTime || !round.endTime) return false;
  if (isFuture(new Date(round.startTime))) {
    return false;
  }
  if (isPast(new Date(round.endTime))) {
    return false;
  }
  return true;
}

export async function getUpcomingRound() {
  const now = new Date();
  const upcomingRound = await db.round.findFirst({
    where: {
      isHidden: false, // Exclude hidden rounds
      startDate: {
        gt: now, // Round hasn't started yet
      },
    },
    include: {
      media: { where: { state: 'UPLOADED' } },
      _count: {
        select: {
          roundCampaigns: {
            where: {
              status: 'APPROVED',
            },
          },
        },
      },
    },
    orderBy: {
      startDate: 'asc', // Get the earliest upcoming round
    },
  });
  return upcomingRound;
}
export async function getActiveRound() {
  const now = new Date();
  const activeRound = await db.round.findFirst({
    where: {
      isHidden: false, // Exclude hidden rounds
      startDate: {
        lte: now, // Round has started
      },
      endDate: {
        gt: now, // Round hasn't ended
      },
    },
    include: {
      media: { where: { state: 'UPLOADED' } },
      _count: {
        select: {
          roundCampaigns: {
            where: {
              status: 'APPROVED',
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Get the latest active round
    },
  });
  return activeRound;
}
