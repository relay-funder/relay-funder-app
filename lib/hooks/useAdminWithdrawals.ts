import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import type { PaginatedResponse } from '@/lib/api/types';
import { resetCampaign } from './useCampaigns';

export const ADMIN_WITHDRAWALS_QUERY_KEY = 'admin_withdrawals';

export type AdminWithdrawalListItem = {
  id: number;
  createdAt: string; // ISO string from API
  amount: string;
  token: string;
  notes?: string | null;
  transactionHash?: string | null;
  requestType: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT';
  campaignId: number;
  campaign: {
    id: number;
    title: string;
    slug: string;
    creatorAddress: string; // Campaign creator address (recipient of funds)
    treasuryAddress?: string | null; // Treasury address for executing withdrawals
  };
  campaignCreator?: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  createdById: number;
  createdBy: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    roles: string[];
  };
  approvedById?: number | null;
  approvedBy?: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export type AdminWithdrawalsStatus = 'APPROVED' | 'PENDING';

export type AdminWithdrawalsFilters = {
  campaignId?: number;
  createdByAddress?: string;
  token?: string;
  status?: AdminWithdrawalsStatus;
  requestType?: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT';
  createdByType?: 'admin' | 'user';
  executionStatus?: 'EXECUTED' | 'NOT_EXECUTED';
};

interface PaginatedWithdrawalsResponse extends PaginatedResponse {
  withdrawals: AdminWithdrawalListItem[];
}

function buildAdminWithdrawalsUrl({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters?: AdminWithdrawalsFilters;
}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (filters?.campaignId != null) {
    params.set('campaignId', String(filters.campaignId));
  }
  if (filters?.createdByAddress) {
    params.set('createdByAddress', filters.createdByAddress);
  }
  if (filters?.token) {
    params.set('token', filters.token);
  }
  if (filters?.status) {
    params.set('status', filters.status);
  }
  if (filters?.requestType) {
    params.set('requestType', filters.requestType);
  }
  if (filters?.createdByType) {
    params.set('createdByType', filters.createdByType);
  }
  if (filters?.executionStatus) {
    params.set('executionStatus', filters.executionStatus);
  }
  return `/api/admin/withdrawals?${params.toString()}`;
}

async function fetchAdminWithdrawalsPage({
  pageParam = 1,
  pageSize = 10,
  filters,
}: {
  pageParam?: number;
  pageSize?: number;
  filters?: AdminWithdrawalsFilters;
}) {
  const safePageSize = Math.min(pageSize ?? 10, 10);
  const url = buildAdminWithdrawalsUrl({
    page: Number(pageParam) || 1,
    pageSize: safePageSize,
    filters,
  });
  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch admin withdrawals');
  const data = await response.json();
  return data as PaginatedWithdrawalsResponse;
}

async function fetchAdminWithdrawals({
  page = 1,
  pageSize = 10,
  filters,
}: {
  page?: number;
  pageSize?: number;
  filters?: AdminWithdrawalsFilters;
}) {
  const pageData = await fetchAdminWithdrawalsPage({
    pageParam: page,
    pageSize,
    filters,
  });
  return pageData.withdrawals;
}

/**
 * Paged admin withdrawals list
 */
export function useAdminWithdrawals({
  page = 1,
  pageSize = 10,
  filters,
}: {
  page?: number;
  pageSize?: number;
  filters?: AdminWithdrawalsFilters;
} = {}) {
  const safePage = page > 0 ? page : 1;
  const safePageSize = Math.min(pageSize ?? 10, 10);

  return useQuery({
    queryKey: [
      ADMIN_WITHDRAWALS_QUERY_KEY,
      'page',
      {
        page: safePage,
        pageSize: safePageSize,
        filters: filters ?? {},
      },
    ],
    queryFn: () =>
      fetchAdminWithdrawals({
        page: safePage,
        pageSize: safePageSize,
        filters,
      }),
    enabled: true,
  });
}

/**
 * Infinite admin withdrawals list
 */
export function useInfiniteAdminWithdrawals({
  pageSize = 10,
  filters,
}: {
  pageSize?: number;
  filters?: AdminWithdrawalsFilters;
} = {}) {
  const safePageSize = Math.min(pageSize ?? 10, 10);

  return useInfiniteQuery<PaginatedWithdrawalsResponse, Error>({
    queryKey: [
      ADMIN_WITHDRAWALS_QUERY_KEY,
      'infinite',
      safePageSize,
      filters ?? {},
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchAdminWithdrawalsPage({
        pageParam: pageParam as number,
        pageSize: safePageSize,
        filters,
      }),
    getNextPageParam: (lastPage: PaginatedWithdrawalsResponse) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage: PaginatedWithdrawalsResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

/**
 * Admin approve withdrawal mutation
 * PATCH /api/campaigns/:campaignId/withdraw
 */
export type ApproveWithdrawalVariables = {
  campaignId: number;
  withdrawalId: number;
  transactionHash: string;
  notes?: string | null;
};

async function approveWithdrawal({
  campaignId,
  withdrawalId,
  transactionHash,
  notes,
}: ApproveWithdrawalVariables) {
  // Use admin-specific endpoint for approving user-initiated withdrawals
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/withdrawals/${withdrawalId}/approve`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash, notes }),
    },
  );
  await handleApiErrors(response, 'Failed to approve withdrawal');
  return response.json();
}

export function useAdminApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveWithdrawal,
    onSuccess: (_data, variables) => {
      // Refresh admin withdrawals lists
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      // Refresh the campaign details related to this withdrawal
      resetCampaign(variables.campaignId, queryClient);
    },
  });
}

export const ADMIN_WITHDRAWAL_QUERY_KEY = 'admin_withdrawal';

// GET /api/admin/withdrawals/:id
async function fetchAdminWithdrawal(id: number) {
  const response = await fetch(`/api/admin/withdrawals/${id}`);
  await handleApiErrors(response, 'Failed to fetch withdrawal');
  const result = await response.json();
  return result.withdrawal;
}

export function useAdminWithdrawal(id: number) {
  return useQuery({
    queryKey: [ADMIN_WITHDRAWAL_QUERY_KEY, id],
    queryFn: () => fetchAdminWithdrawal(id),
    enabled: !!id,
  });
}

// PATCH /api/admin/withdrawals/:id
type UpdateAdminWithdrawalVariables = {
  id: number;
  data: {
    transactionHash?: string | null;
    notes?: string | null;
    approvedById?: number | null;
  };
};

async function patchAdminWithdrawal({
  id,
  data,
}: UpdateAdminWithdrawalVariables) {
  const response = await fetch(`/api/admin/withdrawals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await handleApiErrors(response, 'Failed to update withdrawal');
  return response.json();
}

export function useUpdateAdminWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAdminWithdrawal,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWAL_QUERY_KEY, variables.id],
      });
    },
  });
}

// DELETE /api/admin/withdrawals/:id
type RemoveAdminWithdrawalVariables = {
  id: number;
};

async function removeAdminWithdrawal({ id }: RemoveAdminWithdrawalVariables) {
  const response = await fetch(`/api/admin/withdrawals/${id}`, {
    method: 'DELETE',
  });
  await handleApiErrors(response, 'Failed to delete withdrawal');
  return response.json();
}

export function useRemoveAdminWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAdminWithdrawal,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWAL_QUERY_KEY, variables.id],
      });
    },
  });
}

// POST /api/admin/campaigns/[campaignId]/treasury-authorization
type AuthorizeTreasuryVariables = {
  campaignId: number;
  transactionHash: string;
  notes?: string | null;
};

async function authorizeTreasury({
  campaignId,
  transactionHash,
  notes,
}: AuthorizeTreasuryVariables) {
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/treasury-authorization`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash, notes }),
    },
  );
  await handleApiErrors(response, 'Failed to authorize treasury');
  return response.json();
}

export function useAuthorizeTreasury() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authorizeTreasury,
    onSuccess: (_data, variables) => {
      // Refresh admin withdrawals lists
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      // Refresh the campaign details
      resetCampaign(variables.campaignId, queryClient);
    },
  });
}

// GET /api/admin/withdrawals stats (for dashboard cards)
async function fetchAdminWithdrawalsStats() {
  const [pendingResponse, totalResponse] = await Promise.all([
    fetch('/api/admin/withdrawals?page=1&pageSize=1&status=PENDING'),
    fetch('/api/admin/withdrawals?page=1&pageSize=1'),
  ]);

  await handleApiErrors(pendingResponse, 'Failed to fetch pending withdrawals');
  await handleApiErrors(totalResponse, 'Failed to fetch withdrawals');

  const pendingData = await pendingResponse.json();
  const totalData = await totalResponse.json();

  return {
    pendingCount: pendingData.pagination?.totalItems ?? 0,
    totalCount: totalData.pagination?.totalItems ?? 0,
  };
}

export function useAdminWithdrawalsStats() {
  return useQuery({
    queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'stats'],
    queryFn: fetchAdminWithdrawalsStats,
  });
}

// POST /api/admin/campaigns/[campaignId]/withdrawals/[withdrawalId]/execute
type RecordWithdrawalExecutionVariables = {
  campaignId: number;
  withdrawalId: number;
  transactionHash: string;
};

async function recordWithdrawalExecution({
  campaignId,
  withdrawalId,
  transactionHash,
}: RecordWithdrawalExecutionVariables) {
  const response = await fetch(
    `/api/admin/campaigns/${campaignId}/withdrawals/${withdrawalId}/execute`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash }),
    },
  );
  await handleApiErrors(response, 'Failed to record withdrawal execution');
  return response.json();
}

export function useRecordWithdrawalExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordWithdrawalExecution,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite'],
      });
      resetCampaign(variables.campaignId, queryClient);
    },
  });
}
