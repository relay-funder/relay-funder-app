'use client';

import { useQuery } from '@tanstack/react-query';
import { ONE_MINUTE_MS } from '@/lib/constant/time';
import { type QfCampaignMatching, QfCampaignMatchingSchema } from '@/lib/qf';
import {
  createQfErrorHandler,
  handleQfApiResponse,
  qfRetryConfig,
} from '@/lib/hooks/utils/error-handler';

export const QUERY_KEY_QF_CAMPAIGN_MATCHING = 'qf_campaign_matching';

async function fetchCampaignMatching(
  roundId: number,
  campaignId: number,
): Promise<QfCampaignMatching> {
  const url = `/api/rounds/${roundId}/campaigns/${campaignId}/qf-matching`;

  try {
    const response = await fetch(url);
    return await handleQfApiResponse(
      response,
      'Failed to fetch campaign matching calculation',
      QfCampaignMatchingSchema,
    );
  } catch (error) {
    return createQfErrorHandler()(error);
  }
}

export function useQfCampaignMatching({
  roundId,
  campaignId,
  enabled = true,
}: {
  roundId: number;
  campaignId: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEY_QF_CAMPAIGN_MATCHING, roundId, campaignId],
    queryFn: () => fetchCampaignMatching(roundId, campaignId),
    enabled,
    staleTime: 1 * ONE_MINUTE_MS, // 1 minute - campaign matching might change more frequently
    gcTime: 5 * ONE_MINUTE_MS, // 5 minutes garbage collection
    ...qfRetryConfig,
  });
}
