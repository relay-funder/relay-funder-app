import { useMemo } from 'react';
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { PaginatedResponse } from '@/lib/api/types/common';
import { useUserProfile, PROFILE_QUERY_KEY } from './useProfile';
import { NotificationData } from '@/lib/notification';
import { handleApiErrors } from '@/lib/api/error';

export const EVENT_FEED_QUERY_KEY = 'event_feed';
export const EVENT_FEED_REFETCH_INTERVAL = 90000; // 90 seconds

export type EventFeedItem = {
  createdAt: string;
  type: string;
  message: string;
  data: NotificationData;
};

export type EventFeedFilters = {
  type?: string;
  startDate?: string;
  endDate?: string;
};

export interface PaginatedEventFeedResponse extends PaginatedResponse {
  events: EventFeedItem[];
}

function buildEventFeedUrl({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters?: EventFeedFilters;
}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  if (filters?.type) {
    params.set('type', filters.type);
  }
  if (filters?.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    params.set('endDate', filters.endDate);
  }

  return `/api/event-feed?${params.toString()}`;
}

export async function fetchEventFeedPage({
  pageParam = 1,
  pageSize = 10,
  filters,
}: {
  pageParam?: number;
  pageSize?: number;
  filters?: EventFeedFilters;
}) {
  const safePage = Number(pageParam) || 1;
  const safePageSize = Math.min(Math.max(pageSize ?? 10, 1), 10);
  const url = buildEventFeedUrl({
    page: safePage,
    pageSize: safePageSize,
    filters,
  });

  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch event feed');

  const data = (await response.json()) as PaginatedEventFeedResponse;
  return data;
}

export function useInfiniteEventFeed({
  pageSize = 10,
  filters,
}: {
  pageSize?: number;
  filters?: EventFeedFilters;
} = {}) {
  const safePageSize = Math.min(Math.max(pageSize ?? 10, 1), 10);

  const queryKey = [
    EVENT_FEED_QUERY_KEY,
    'infinite',
    safePageSize,
    filters ?? null,
  ] as const;

  return useInfiniteQuery<PaginatedEventFeedResponse, Error>({
    queryKey,
    queryFn: ({ pageParam = 1 }) =>
      fetchEventFeedPage({
        pageParam: pageParam as number,
        pageSize: safePageSize,
        filters,
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
    refetchInterval: EVENT_FEED_REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

async function markEventFeedRead() {
  const response = await fetch('/api/event-feed', {
    method: 'POST',
  });
  await handleApiErrors(response, 'Failed to mark event feed as read');

  return response.json() as Promise<{ success: boolean }>;
}

export function useMarkEventFeedRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markEventFeedRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_FEED_QUERY_KEY, 'infinite'],
      });
      queryClient.invalidateQueries({
        queryKey: [PROFILE_QUERY_KEY],
      });
    },
  });
}

export function useNewEventCount() {
  const { data: user } = useUserProfile();
  const { data, hasNextPage } = useInfiniteEventFeed({ pageSize: 10 });

  const count = useMemo(() => {
    if (!user?.eventFeedRead || !data?.pages[0]?.events) return 0;
    const readTime = new Date(user.eventFeedRead);
    const newEvents = data.pages[0].events.filter(
      (event) => new Date(event.createdAt) > readTime,
    );
    return hasNextPage && newEvents.length === 10 ? 10 : newEvents.length;
  }, [data, user?.eventFeedRead, hasNextPage]);

  return count;
}
