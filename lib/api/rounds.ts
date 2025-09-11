import { Campaign, db, Round, RoundCampaigns } from '@/server/db';
import { GetRoundResponseInstance, GetRoundsStatsResponse } from './types/rounds';
import { ROUND_QUERY_KEY, ROUNDS_QUERY_KEY } from '../hooks/useRounds';
import { QueryClient } from '@tanstack/react-query';
import { ApiNotFoundError } from './error';
import { mapCampaign } from './campaigns';

export function mapRound(
  round: Round & {
    roundCampaigns?: (RoundCampaigns & { Campaign: Campaign })[];
  },
  status?: 'PENDING' | 'APPROVED' | 'REJECTED',
): GetRoundResponseInstance {
  const {
    startDate,
    endDate,
    applicationStart,
    applicationClose,
    poolId,
    ...roundWithoutDeprecated
  } = round;
  return {
    ...roundWithoutDeprecated,
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
        campaign: mapCampaign(roundCampaign.Campaign),
      })) ?? [],
    // transient
    recipientStatus: status,
  };
}
export async function listRounds({
  page = 1,
  pageSize = 10,
  skip = 0,
  admin = false,
}: {
  page?: number;
  pageSize?: number;
  skip?: number;
  admin?: boolean;
}) {
  const [rounds, totalCount] = await Promise.all([
    db.round.findMany({
      skip,
      include: {
        roundCampaigns: {
          include: { Campaign: true },
          where: admin ? {} : { status: 'APPROVED' },
        },
      },
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    db.round.count(),
  ]);

  return {
    rounds: rounds.map((round) => mapRound(round, 'APPROVED')),
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
      roundCampaigns: {
        include: { Campaign: { include: { images: true } } },
        where: admin
          ? {}
          : {
              OR: [
                { status: 'APPROVED' },
                { Campaign: { creatorAddress: sessionAddress ?? undefined } },
              ],
            },
      },
    },
  });
  if (!round) {
    throw new ApiNotFoundError(`Round with id ${id} does not exist`);
  }
  return mapRound(round);
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
