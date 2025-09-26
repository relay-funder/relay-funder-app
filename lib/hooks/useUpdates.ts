import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { GetCampaignUpdatesResponse } from '@/lib/api/types';
export const CAMPAIGNS_UPDATES_QUERY_KEY = 'campaigns_updates';

interface ICreateCampaignUpdate {
  campaignId: number;
  title: string;
  content: string;
}
async function createCampaignUpdate(variables: ICreateCampaignUpdate) {
  const { campaignId, title, content } = variables;
  const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create update');
  }

  return response.json();
}

type PaginatedUpdateResponse = GetCampaignUpdatesResponse;

async function fetchUpdatePage({
  campaignId,
  pageParam = 1,
  pageSize = 10,
}: {
  campaignId: number;
  pageParam?: number;
  pageSize?: number;
}) {
  const url = `/api/campaigns/${campaignId}/updates?page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch updates');
  }
  const data = await response.json();
  return data as PaginatedUpdateResponse;
}

export function useInfiniteCampaignUpdates(campaignId: number, pageSize = 10) {
  return useInfiniteQuery<PaginatedUpdateResponse, Error>({
    queryKey: [CAMPAIGNS_UPDATES_QUERY_KEY, 'infinite', campaignId],
    queryFn: ({ pageParam = 1 }) =>
      fetchUpdatePage({
        campaignId,
        pageParam: pageParam as number,
        pageSize,
      }),
    getNextPageParam: (lastPage: PaginatedUpdateResponse) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedUpdateResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}
export function useCreateCampaignUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignUpdate,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          CAMPAIGNS_UPDATES_QUERY_KEY,
          'infinite',
          variables.campaignId,
        ],
      });
    },
  });
}
