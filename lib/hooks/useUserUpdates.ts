import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

interface UpdateCampaign {
  id: number;
  title: string;
  slug: string;
  status: string;
  category: string;
  location: string;
  creatorAddress: string;
  image: string | null;
}

interface UpdateMedia {
  url: string;
  mimeType: string;
  caption: string | null;
}

export interface UserUpdate {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  creatorAddress: string;
  campaign: UpdateCampaign;
  media: UpdateMedia[];
}

interface PaginatedUpdatesResponse {
  updates: UserUpdate[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

const USER_UPDATES_QUERY_KEY = 'user_updates';

async function fetchUserUpdates({
  pageParam = 1,
  pageSize = 10,
}: {
  pageParam?: number;
  pageSize?: number;
}) {
  const url = `/api/users/updates?page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch updates');
  }
  const data = await response.json();
  return data as PaginatedUpdatesResponse;
}

export function useUserUpdates({ pageSize = 10 }: { pageSize?: number } = {}) {
  return useQuery({
    queryKey: [USER_UPDATES_QUERY_KEY, 'page', pageSize],
    queryFn: () => fetchUserUpdates({ pageParam: 1, pageSize }),
    enabled: true,
  });
}

export function useInfiniteUserUpdates({
  pageSize = 10,
}: { pageSize?: number } = {}) {
  return useInfiniteQuery<PaginatedUpdatesResponse, Error>({
    queryKey: [USER_UPDATES_QUERY_KEY, 'infinite', pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserUpdates({ pageParam: pageParam as number, pageSize }),
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
