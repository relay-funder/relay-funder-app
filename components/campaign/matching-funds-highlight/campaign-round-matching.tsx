'use client';

import { GetRoundResponseInstance } from '@/lib/api/types';
import { useCampaignMatching } from '@/lib/hooks/useCampaignMatching';
import clsx from 'clsx';
import { useMemo } from 'react';

export function CampaignRoundMatching({
  round,
  campaignId,
}: {
  round: GetRoundResponseInstance;
  campaignId: number;
}) {
  const status = useMemo(() => {
    const now = new Date();
    if (now >= new Date(round.startTime) && now <= new Date(round.endTime)) {
      return 'Active';
    }
    if (now > new Date(round.endTime)) {
      return 'Ended';
    }
    return 'Upcoming';
  }, [round]);

  const isUpcomingRound = status === 'Upcoming';
  const hasMatchingPool = round.matchingPool > 0;

  const { data: estimatedMatch, isPending } = useCampaignMatching({
    roundId: round.id,
    campaignId,
    enabled: hasMatchingPool && !isUpcomingRound,
  });

  const formattedEstimatedMatch = useMemo(() => {
    if (isPending) {
      return '$ ...';
    }
    return estimatedMatch ? `$${parseFloat(estimatedMatch).toFixed(2)}` : 'TBD';
  }, [estimatedMatch, isPending]);

  return (
    <div>
      <div className="mt-2">
        <span className="text-sm font-medium text-green-800">
          {round.title}
        </span>
      </div>
      {!isUpcomingRound && (
        <div
          className={clsx(
            'mt-1 flex items-center gap-2',
            isPending && 'animate-pulse',
          )}
        >
          <span className="text-sm text-green-700">Estimated match</span>
          <span className="text-sm font-semibold text-green-800">
            {formattedEstimatedMatch}
          </span>
        </div>
      )}
      {hasMatchingPool && (
        <div className="mt-1">
          <span className="text-xs text-green-600">
            Pool: ${round.matchingPool.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
