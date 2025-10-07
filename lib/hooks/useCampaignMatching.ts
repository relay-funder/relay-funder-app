'use client';

import { useMatchingCalculation } from './useMatchingCalculation';

export function useCampaignMatching({
  roundId,
  campaignId,
  enabled = true,
}: {
  roundId: number;
  campaignId: number;
  enabled?: boolean;
}) {
  const roundDistribution = useMatchingCalculation({ roundId, enabled });
  const distributionAmount = roundDistribution.data?.distribution.find(
    (campaign) => campaign.id === campaignId,
  )?.matchingAmount;
  return { ...roundDistribution, data: distributionAmount };
}
