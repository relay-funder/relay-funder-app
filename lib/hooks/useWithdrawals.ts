import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import type {
  PostCampaignWithdrawRouteResponse,
  GetCampaignWithdrawRouteResponse,
} from '@/lib/api/types';
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
  transactionHash?: string;
}

async function requestWithdrawal({
  campaignId,
  amount,
  token,
  transactionHash,
}: RequestWithdrawalVariables) {
  const response = await fetch(`/api/campaigns/${campaignId}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: String(amount),
      token,
      ...(transactionHash && { transactionHash }),
    }),
  });
  await handleApiErrors(response, 'Failed to request withdrawal');

  const data = (await response.json()) as PostCampaignWithdrawRouteResponse;
  return data;
}

async function fetchWithdrawApproval(campaignId?: string | number) {
  if (!campaignId) throw new Error('Campaign ID is required');
  const response = await fetch(`/api/campaigns/${campaignId}/withdraw`);
  await handleApiErrors(response, 'Failed to check withdrawal approval');
  const data = (await response.json()) as GetCampaignWithdrawRouteResponse;
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

/**
 * useWithdrawalApproval
 * Hook to check if a campaign has withdrawal approval (at least one approved withdrawal).
 *
 * - GET /api/campaigns/[campaignId]/withdraw
 * - Returns { hasApproval: boolean }
 */
export function useWithdrawalApproval(campaignId: number | string | undefined) {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, 'approval', campaignId],
    queryFn: async () => fetchWithdrawApproval(campaignId),
    enabled: !!campaignId,
  });
}
