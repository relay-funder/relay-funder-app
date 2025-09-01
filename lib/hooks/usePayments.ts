import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { Payment } from '@/types/campaign';
import { resetCampaign } from './useCampaigns';
import { GetCampaignPaymentResponseInstance } from '../api/types/campaigns/payments';
export const PAYMENT_QUERY_KEY = 'payment';
import {
  CAMPAIGN_STATS_QUERY_KEY,
  CAMPAIGN_PAYMENTS_QUERY_KEY,
} from './useCampaigns';
interface ICreatePaymentApi {
  amount: string;
  poolAmount: number;
  token: string;
  campaignId: number;
  status: string;
  transactionHash: string;
  isAnonymous: boolean;
}

async function createPayment(variables: ICreatePaymentApi): Promise<Payment> {
  const response = await fetch(`/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  });
  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create payment record:', error);
    throw new Error(error.error || 'Failed to fetch user payments');
  }
  const data = await response.json();
  return data;
}
interface IUpdatePaymentStatusApi {
  paymentId: number;
  status: string;
}
async function updatePaymentStatus(variables: IUpdatePaymentStatusApi) {
  const response = await fetch(`/api/payments`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  });
  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update payment record:', error);
    throw new Error(error.error || 'Failed to update user payment');
  }
  return response.json();
}
interface IRemovePayment {
  campaignId: number;
  paymentId: number;
}
async function removePayment(variables: IRemovePayment) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/payments/`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove comment');
  }

  return response.json();
}
interface PaginatedResponse {
  payments: GetCampaignPaymentResponseInstance[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}
async function fetchPaymentPage({
  campaignId,
  pageParam = 1,
  pageSize = 10,
}: {
  campaignId: number;
  pageParam?: number;
  pageSize?: number;
}) {
  const url = `/api/campaigns/${campaignId}/payments?page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payments');
  }
  const data = await response.json();
  return data as PaginatedResponse;
}

export function useInfinitePayments(campaignId: number, pageSize = 10) {
  return useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: [CAMPAIGN_PAYMENTS_QUERY_KEY, 'infinite', campaignId],
    queryFn: ({ pageParam = 1 }) =>
      fetchPaymentPage({
        campaignId,
        pageParam: pageParam as number,
        pageSize,
      }),
    getNextPageParam: (lastPage: PaginatedResponse) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_QUERY_KEY],
      });
      resetCampaign(variables.campaignId, queryClient);
    },
  });
}
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [PAYMENT_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });
      resetCampaign(data.campaignId, queryClient);
    },
  });
}
export function useRemovePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removePayment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          CAMPAIGN_PAYMENTS_QUERY_KEY,
          'infinite',
          variables.campaignId,
        ],
      });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGN_STATS_QUERY_KEY] });
    },
  });
}
