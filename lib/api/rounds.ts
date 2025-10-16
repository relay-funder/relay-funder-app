import { Campaign, db, Media, Round, RoundCampaigns } from '@/server/db';
import {
  GetRoundResponseInstance,
  GetRoundsStatsResponse,
} from './types/rounds';
import type { GetCampaignPaymentSummary } from './types/campaigns';
import { ROUND_QUERY_KEY, ROUNDS_QUERY_KEY } from '../hooks/useRounds';
import { QueryClient } from '@tanstack/react-query';
import { ApiNotFoundError } from './error';
import { mapCampaign, getPaymentSummaryList } from './campaigns';
import { isFuture, isPast } from 'date-fns';

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
}: {
  page?: number;
  pageSize?: number;
  skip?: number;
  admin?: boolean;
  userAddress?: string | null;
}) {
  const [rounds, totalCount] = await Promise.all([
    db.round.findMany({
      skip,
      where: admin ? {} : { isHidden: false }, // Exclude hidden rounds for non-admins
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
                      in: ['CONFIRMED', 'PENDING'],
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
      where: admin ? {} : { isHidden: false }, // Exclude hidden rounds for non-admins
    }),
  ]);

  // Calculate payment summaries for all campaigns in all rounds
  const allCampaignIds = rounds.flatMap(
    (round) =>
      round.roundCampaigns?.map((rc) => rc.campaignId).filter(Boolean) || [],
  );
  const paymentSummaryList =
    allCampaignIds.length > 0
      ? await getPaymentSummaryList(allCampaignIds)
      : {};

  // Add payment summaries to campaigns in rounds
  const roundsWithPaymentSummaries = rounds.map((round) => ({
    ...round,
    roundCampaigns: round.roundCampaigns?.map((rc) => ({
      ...rc,
      Campaign: rc.Campaign
        ? {
            ...rc.Campaign,
            paymentSummary: paymentSummaryList[rc.campaignId] || {},
          }
        : rc.Campaign,
    })),
  }));

  return {
    rounds: roundsWithPaymentSummaries.map((round) => mapRound(round)), // Remove hardcoded status
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
                    in: ['CONFIRMED', 'PENDING'],
                  },
                },
              },
            },
          },
        },
        where: admin
          ? {}
          : {
              AND: [
                // Exclude hidden rounds for non-admins
                { Round: { isHidden: false } },
                {
                  OR: [
                    {
                      status: 'APPROVED',
                      Campaign: {
                        status: {
                          in: ['ACTIVE', 'COMPLETED', 'FAILED'],
                        },
                      },
                    },
                    {
                      Campaign: { creatorAddress: sessionAddress ?? undefined },
                    },
                  ],
                },
              ],
            },
      },
    },
  });

  if (!round) {
    throw new ApiNotFoundError(`Round with id ${id} does not exist`);
  }

  // Calculate payment summaries for campaigns
  const campaignIds =
    round.roundCampaigns?.map((rc) => rc.campaignId).filter(Boolean) || [];
  const paymentSummaryList =
    campaignIds.length > 0 ? await getPaymentSummaryList(campaignIds) : {};

  // Add payment summaries to campaigns
  const roundWithPaymentSummaries = {
    ...round,
    roundCampaigns: round.roundCampaigns?.map((rc) => ({
      ...rc,
      Campaign: rc.Campaign
        ? {
            ...rc.Campaign,
            paymentSummary: paymentSummaryList[rc.campaignId] || {},
          }
        : rc.Campaign,
    })),
  };

  return mapRound(roundWithPaymentSummaries);
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
