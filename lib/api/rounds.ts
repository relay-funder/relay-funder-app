import { Campaign, db, Round, RoundCampaigns } from '@/server/db';
import { GetRoundsStatsResponse } from './types';

export function mapRound(
  round: Round & {
    roundCampaigns: (RoundCampaigns & { Campaign: Campaign })[];
  },
) {
  return {
    ...round,
    // map future field names
    startTime: round.startDate,
    endTime: round.endDate,
    applicationStartTime: round.applicationStart,
    applicationEndTime: round.applicationClose,
    roundCampaigns:
      round.roundCampaigns?.map((roundCampaign) => ({
        ...roundCampaign,
        campaign: roundCampaign.Campaign,
      })) ?? [],
  };
}
export async function listRounds({
  page = 1,
  pageSize = 10,
  skip = 0,
}: {
  page?: number;
  pageSize?: number;
  skip?: number;
}) {
  const [rounds, totalCount] = await Promise.all([
    db.round.findMany({
      skip,
      include: {
        roundCampaigns: {
          include: { Campaign: true },
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
    rounds: rounds.map(mapRound),
    pagination: {
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
      totalItems: totalCount,
      hasMore: skip + pageSize < totalCount,
    },
  };
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
