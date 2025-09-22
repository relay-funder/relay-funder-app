import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostCampaignWithdrawRouteResponse } from '@/lib/api/types';
import {
  CAMPAIGNS_QUERY_KEY,
  CAMPAIGN_PAYMENTS_QUERY_KEY,
  resetCampaign,
} from './useCampaigns';

export const WITHDRAWALS_QUERY_KEY = 'withdrawals';

export interface RequestWithdrawalVariables {
  campaignId: number | string; // accepts numeric ID or slug
  amount: string | number;
  token: string;
}

async function requestWithdrawal({
  campaignId,
  amount,
  token,
}: RequestWithdrawalVariables) {
  const response = await fetch(`/api/campaigns/${campaignId}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: String(amount),
      token,
    }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to request withdrawal';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = (await response.json()) as PostCampaignWithdrawRouteResponse;
  return data;
}

/**
 * useRequestWithdrawal
 * User-facing hook to request a withdrawal for a campaign.
 *
 * - POST /api/campaigns/[campaignId]/withdraw
 * - Expects { amount, token } in the body
 * - Invalidates campaign queries and resets the specific campaign on success
 */
export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: (_data, variables) => {
      // Always refresh general campaigns lists
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });

      // Also refresh user campaign listing pages that might show updated summaries
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', 'active', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', 'active', 3],
      });

      // If we have a numeric campaign ID, reset the precise campaign data and its payments list
      if (typeof variables.campaignId === 'number') {
        resetCampaign(variables.campaignId, queryClient);
        queryClient.invalidateQueries({
          queryKey: [CAMPAIGN_PAYMENTS_QUERY_KEY, variables.campaignId],
        });
      } else if (typeof variables.campaignId === 'string') {
        // If we only have a slug, invalidate the slug-specific campaign query
        queryClient.invalidateQueries({
          queryKey: [CAMPAIGNS_QUERY_KEY, variables.campaignId],
        });
      }
    },
  });
}
