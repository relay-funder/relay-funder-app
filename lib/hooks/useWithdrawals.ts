import {
  useMutation,
  useQueryClient,
  useQuery,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import type {
  PostCampaignWithdrawRouteResponse,
  GetCampaignWithdrawRouteResponse,
  CampaignWithdrawal,
  PaginatedUserWithdrawalsResponse,
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

      // Invalidate user withdrawals list
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWALS_QUERY_KEY, 'user', 'infinite'],
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
 * Hook to check if a campaign has withdrawal approval and on-chain authorization.
 *
 * - GET /api/campaigns/[campaignId]/withdraw
 * - Returns { hasApproval: boolean, onChainAuthorized: boolean }
 */
export function useWithdrawalApproval(
  campaignId: number | string | undefined,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, 'approval', campaignId],
    queryFn: async () => fetchWithdrawApproval(campaignId),
    enabled: enabled && !!campaignId,
  });
}

/**
 * Request treasury authorization (user-initiated)
 * Creates an ON_CHAIN_AUTHORIZATION request that admin must approve
 */
async function requestTreasuryAuthorization(campaignId: number | string) {
  const response = await fetch(
    `/api/campaigns/${campaignId}/treasury-authorization`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  await handleApiErrors(response, 'Failed to request treasury authorization');
  return response.json();
}

export function useRequestTreasuryAuthorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestTreasuryAuthorization,
    onSuccess: (_data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [WITHDRAWALS_QUERY_KEY, 'approval', campaignId],
      });
      if (typeof campaignId === 'number') {
        resetCampaign(campaignId, queryClient);
      }
    },
  });
}

/**
 * Fetch all withdrawals for a campaign (user-facing)
 * GET /api/campaigns/[campaignId]/withdrawals
 */
async function fetchCampaignWithdrawals(campaignId: number | string) {
  const response = await fetch(`/api/campaigns/${campaignId}/withdrawals`);
  await handleApiErrors(response, 'Failed to fetch campaign withdrawals');
  const data = await response.json();
  return data.withdrawals as CampaignWithdrawal[];
}

export function useCampaignWithdrawals(
  campaignId: number | string | undefined,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, 'campaign', campaignId],
    queryFn: () => fetchCampaignWithdrawals(campaignId!),
    enabled: enabled && !!campaignId,
  });
}

async function fetchUserWithdrawals({
  pageParam = 1,
  pageSize = 10,
}: {
  pageParam?: number;
  pageSize?: number;
}) {
  const url = `/api/users/me/withdrawals?page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch withdrawals');
  const data = await response.json();
  return data as PaginatedUserWithdrawalsResponse;
}

export function useUserWithdrawals({
  pageSize = 10,
}: { pageSize?: number } = {}) {
  return useQuery({
    queryKey: [WITHDRAWALS_QUERY_KEY, 'user', 'page', pageSize],
    queryFn: () => fetchUserWithdrawals({ pageParam: 1, pageSize }),
    enabled: true,
  });
}

export function useInfiniteUserWithdrawals({
  pageSize = 10,
}: { pageSize?: number } = {}) {
  return useInfiniteQuery<PaginatedUserWithdrawalsResponse, Error>({
    queryKey: [WITHDRAWALS_QUERY_KEY, 'user', 'infinite', pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserWithdrawals({ pageParam: pageParam as number, pageSize }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}
