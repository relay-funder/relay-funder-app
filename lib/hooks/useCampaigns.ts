import { useCallback } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type {
  GetCampaignResponseInstance,
  GetCampaignResponse,
  GetCampaignPaymentsResponse,
  PostCampaignsResponse,
  PatchCampaignResponse,
  PostCampaignApproveResponse,
  GetCampaignsStatsResponse,
} from '@/lib/api/types';
import { DbCampaign } from '@/types/campaign';
import { PaginatedResponse } from '@/lib/api/types/common';

export const CAMPAIGNS_QUERY_KEY = 'campaigns';
export const CAMPAIGN_STATS_QUERY_KEY = 'campaign_stats';
export const CAMPAIGN_PAYMENTS_QUERY_KEY = 'campaign_payments';

interface PaginatedCampaignResponse extends PaginatedResponse {
  campaigns: GetCampaignResponseInstance[];
}

async function fetchCampaigns(status?: string) {
  const url = status ? `/api/campaigns?status=${status}` : '/api/campaigns';
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaigns');
  }
  const data = await response.json();
  return data.campaigns;
}
async function fetchCampaign(slug: string | number) {
  const url = `/api/campaigns/${slug}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaign');
  }
  const data = await response.json();
  return data as GetCampaignResponse;
}

async function fetchCampaignPayments({
  id,
  pageParam = 1,
  status = 'confirmed',
  pageSize = 10,
}: {
  id: number;
  pageParam?: number;
  status?: 'confirmed' | 'pending';
  pageSize?: number;
}) {
  const url = `/api/campaigns/${id}/payments?status=${status}&page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaign');
  }
  const data = (await response.json()) as GetCampaignPaymentsResponse;
  return data?.payments ?? [];
}

async function fetchCampaignPage({
  pageParam = 1,
  status = 'active',
  rounds = false,
  pageSize = 10,
}) {
  const url = `/api/campaigns?status=${status}&page=${pageParam}&pageSize=${pageSize}&rounds=${rounds}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaigns');
  }
  const data = await response.json();
  return data as PaginatedCampaignResponse;
}

async function fetchUserCampaignPage({
  pageParam = 1,
  status = 'active',
  rounds = false,
  pageSize = 10,
}) {
  const url = `/api/campaigns/user?status=${status}&page=${pageParam}&pageSize=${pageSize}&rounds=${rounds}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaigns');
  }
  const data = await response.json();
  return data as PaginatedCampaignResponse;
}
async function fetchCampaignStats(scope?: 'user' | 'global') {
  const params = new URLSearchParams();
  if (scope) {
    params.set('scope', scope);
  }
  const url = `/api/campaigns/stats${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaign');
  }
  const data = await response.json();
  return data as GetCampaignsStatsResponse;
}

interface IUpdateCampaign {
  campaignId: number;
  status?: string;
  transactionHash?: string;
  campaignAddress?: string;
}
async function updateCampaign(variables: IUpdateCampaign) {
  const response = await fetch('/api/campaigns', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update campaign');
  }

  const data = await response.json();
  return data as PatchCampaignResponse;
}
interface IUpdateCampaignData {
  campaignId: number;
  title: string;
  description: string;
  location: string;
  category: string;
  bannerImage?: File | null;
}
async function updateCampaignData(variables: IUpdateCampaignData) {
  const formDataToSend = new FormData();
  formDataToSend.append('campaignId', `${variables.campaignId}`);
  formDataToSend.append('title', variables.title);
  formDataToSend.append('description', variables.description);
  formDataToSend.append('location', variables.location);
  formDataToSend.append('category', variables.category);
  if (variables.bannerImage) {
    formDataToSend.append('bannerImage', variables.bannerImage);
  }
  const response = await fetch('/api/campaigns/user', {
    method: 'PATCH',
    body: formDataToSend,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update campaign');
  }

  const data = await response.json();
  return data as PatchCampaignResponse;
}
interface ICreateCampaign {
  title: string;
  description: string;
  fundingGoal: string;
  selectedRoundId: number | null;
  startTime: string;
  endTime: string;
  status?: string;
  location: string;
  category: string;
  bannerImage?: File | null;
}
async function createCampaign({
  title,
  description,
  fundingGoal,
  selectedRoundId,
  startTime,
  endTime,
  status = 'draft',
  location,
  category,
  bannerImage,
}: ICreateCampaign) {
  const formDataToSend = new FormData();
  formDataToSend.append('title', title);
  formDataToSend.append('description', description);
  formDataToSend.append('fundingGoal', fundingGoal);
  if (selectedRoundId != null && selectedRoundId > 0) {
    formDataToSend.append('selectedRoundId', `${selectedRoundId}`);
  }
  formDataToSend.append('startTime', startTime);
  formDataToSend.append('endTime', endTime);
  formDataToSend.append('status', status);
  formDataToSend.append('location', location);
  formDataToSend.append('category', category);
  if (bannerImage) {
    formDataToSend.append('bannerImage', bannerImage);
  }
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    body: formDataToSend,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to save campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data as PostCampaignsResponse;
}
interface IApproveCampaign {
  campaignId: number;
  treasuryAddress: string;
  cryptoTreasuryAddress?: string;
  paymentTreasuryAddress?: string;
  cryptoTreasuryTx?: string;
  paymentTreasuryTx?: string;
}
async function approveCampaign(variables: IApproveCampaign) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify(variables),
    },
  );
  if (!response.ok) {
    let errorMsg = 'Failed to approve campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data as PostCampaignApproveResponse;
}
interface IDisableCampaign {
  campaignId: number;
}

async function disableCampaign(variables: IDisableCampaign) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/disable`,
    {
      method: 'POST',
      body: JSON.stringify(variables),
    },
  );
  if (!response.ok) {
    let errorMsg = 'Failed to disable campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

async function enableCampaign(variables: IDisableCampaign) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/enable`,
    {
      method: 'POST',
      body: JSON.stringify(variables),
    },
  );
  if (!response.ok) {
    let errorMsg = 'Failed to enable campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}
async function removeCampaign(variables: IDisableCampaign) {
  const response = await fetch(`/api/campaigns/${variables.campaignId}`, {
    method: 'DELETE',
    body: JSON.stringify(variables),
  });
  if (!response.ok) {
    let errorMsg = 'Failed to remove campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

interface IUpdateCampaignTransaction {
  campaignId: number;
  transactionHash: string;
  campaignAddress?: string | null;
}

async function updateCampaignTransactionApi(
  variables: IUpdateCampaignTransaction,
) {
  const response = await fetch(
    `/api/admin/campaigns/${variables.campaignId}/update-transaction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionHash: variables.transactionHash,
        campaignAddress: variables.campaignAddress,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to update campaign transaction: ${errorData.error || 'Unknown error'}`,
    );
  }

  return response.json();
}

export function resetCampaign(id: number, queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY, id] });
  // we only know the campaignId here, use the query-cache to find the
  // slug which is commonly stored as queryKey
  const queries = queryClient.getQueryCache().findAll();
  const campaignQueries = queries.filter(
    (query) => query.queryKey[0] === CAMPAIGNS_QUERY_KEY,
  );
  for (const campaignQuery of campaignQueries) {
    const campaignData = queryClient.getQueryData(
      campaignQuery.queryKey,
    ) as GetCampaignResponse;
    if (
      campaignData?.campaign?.id === id &&
      typeof campaignData?.campaign?.slug !== 'undefined'
    ) {
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, campaignData.campaign.slug],
      });
    }
  }
}
export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, status],
    queryFn: () => fetchCampaigns(status),
    enabled: true,
  });
}
export function useCampaign(slug: string | number) {
  return useQuery({
    queryKey: [CAMPAIGNS_QUERY_KEY, slug],
    queryFn: () => fetchCampaign(slug),
    enabled: true,
  });
}

export function useInfiniteCampaigns(
  status = 'active',
  pageSize = 10,
  rounds = false,
) {
  return useInfiniteQuery<PaginatedCampaignResponse, Error>({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'infinite', status, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchCampaignPage({
        pageParam: pageParam as number,
        status,
        pageSize,
        rounds,
      }),
    getNextPageParam: (lastPage: PaginatedCampaignResponse) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedCampaignResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useInfiniteUserCampaigns(
  status = 'active',
  pageSize = 10,
  rounds = true,
) {
  return useInfiniteQuery<PaginatedCampaignResponse, Error>({
    queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', status, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserCampaignPage({
        pageParam: pageParam as number,
        status,
        pageSize,
        rounds,
      }),
    getNextPageParam: (lastPage: PaginatedCampaignResponse) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedCampaignResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useCampaignPayments({ id }: { id: number }) {
  return useQuery({
    queryKey: [CAMPAIGN_PAYMENTS_QUERY_KEY, id],
    queryFn: () => fetchCampaignPayments({ id }),
    enabled: true,
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
    },
  });
}
export function useUpdateCampaignData({ campaign }: { campaign: DbCampaign }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaignData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, campaign.slug],
      });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', 'active', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', 'active', 3],
      });
    },
  });
}
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', 'active', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, 'user', 'infinite', 'active', 3],
      });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });
    },
  });
}
export function useAdminApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });
    },
  });
}
export function useAdminDisableCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disableCampaign,
    onSuccess: () => {
      // Invalidate all campaign-related queries more aggressively
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey && query.queryKey[0] === CAMPAIGNS_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });

      // Force refetch of all campaign data
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey && query.queryKey[0] === CAMPAIGNS_QUERY_KEY,
      });
    },
  });
}

export function useAdminEnableCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enableCampaign,
    onSuccess: () => {
      // Invalidate all campaign-related queries more aggressively
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey && query.queryKey[0] === CAMPAIGNS_QUERY_KEY,
      });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });

      // Force refetch of all campaign data
      queryClient.refetchQueries({
        predicate: (query) =>
          query.queryKey && query.queryKey[0] === CAMPAIGNS_QUERY_KEY,
      });
    },
  });
}
export function useAdminRemoveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });
    },
  });
}

export function useRefetchCampaign(campaignId: number) {
  const queryClient = useQueryClient();
  const refetch = useCallback(() => {
    resetCampaign(campaignId, queryClient);
  }, [queryClient, campaignId]);
  return refetch;
}

export function useCampaignStats(scope?: 'user' | 'global') {
  return useQuery({
    queryKey: [CAMPAIGN_STATS_QUERY_KEY, scope],
    queryFn: () => fetchCampaignStats(scope),
    enabled: true,
  });
}

export function useAdminUpdateCampaignTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCampaignTransactionApi,
    onSuccess: (data, variables) => {
      // Invalidate campaign-related queries
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [CAMPAIGNS_QUERY_KEY, variables.campaignId],
      });
      // Reset campaign to get fresh data
      resetCampaign(variables.campaignId, queryClient);
    },
  });
}
