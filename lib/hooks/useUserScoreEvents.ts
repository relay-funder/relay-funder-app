import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts';
import { ScoreEvent, GetScoreEventsResponse } from '@/lib/api/types';

async function fetchUserScoreEventsPage({
  pageParam = 1,
  pageSize = 10,
  category,
}: {
  pageParam?: number;
  pageSize?: number;
  category?: 'donor' | 'creator';
}): Promise<GetScoreEventsResponse> {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (category) {
    params.set('category', category);
  }

  const response = await fetch(`/api/users/me/score/events?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch score events');
  }
  return response.json();
}

export function useUserScoreEvents({
  pageSize = 10,
  category,
}: {
  pageSize?: number;
  category?: 'donor' | 'creator';
} = {}) {
  const { authenticated } = useAuth();
  return useInfiniteQuery<GetScoreEventsResponse, Error>({
    queryKey: ['user_score_events', pageSize, category],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserScoreEventsPage({
        pageParam: pageParam as number,
        pageSize,
        category,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
    enabled: authenticated,
  });
}

export type { ScoreEvent };
