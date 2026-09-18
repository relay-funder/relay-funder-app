import { useMemo } from 'react';
import type { GetRoundResponseInstance } from '@/lib/api/types';
import { buildRoundResultsView } from '@/lib/round-results';
import { usePublicRoundResults } from '@/lib/hooks/usePublicRoundResults';

// Matching per campaign, summed across rounds, using the same figures the
// public round results pages show. Cached per rounds array so a list of
// cards builds each round view once.
const matchFundingCache = new WeakMap<
  GetRoundResponseInstance[],
  Map<number, number>
>();

function getMatchFundingByCampaignId(
  rounds: GetRoundResponseInstance[],
): Map<number, number> {
  const cached = matchFundingCache.get(rounds);
  if (cached) {
    return cached;
  }

  const matchFundingByCampaignId = new Map<number, number>();
  rounds.forEach((round) => {
    buildRoundResultsView(round).campaigns.forEach((campaign) => {
      if (campaign.matchFunding > 0) {
        matchFundingByCampaignId.set(
          campaign.id,
          (matchFundingByCampaignId.get(campaign.id) ?? 0) +
            campaign.matchFunding,
        );
      }
    });
  });

  matchFundingCache.set(rounds, matchFundingByCampaignId);
  return matchFundingByCampaignId;
}

export function useCampaignMatchFunding(campaignId?: number) {
  const { data: rounds, isPending } = usePublicRoundResults();

  const matchFunding = useMemo(() => {
    if (!rounds || typeof campaignId !== 'number') {
      return 0;
    }
    return getMatchFundingByCampaignId(rounds).get(campaignId) ?? 0;
  }, [rounds, campaignId]);

  return { matchFunding, isPending };
}
