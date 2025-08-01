import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Payment } from '@/types/campaign';
import { CAMPAIGNS_QUERY_KEY } from './useCampaigns';
import { GetCampaignResponse } from '../api/types';

export const PAYMENT_QUERY_KEY = 'payment';
interface ICreatePaymentApi {
  amount: string;
  poolAmount: number;
  token: string;
  campaignId: number;
  status: string;
  transactionHash: string;
  isAnonymous: boolean;
}
function resetCampaign(id: number, queryClient: QueryClient) {
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
      resetCampaign(data.campaignId, queryClient);
    },
  });
}
