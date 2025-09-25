import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const EVENT_FEED_QUERY_KEY = 'event_feed';

export type EventFeedItem = {
  createdAt: string;
  type: string;
  message: string;
  data: unknown;
};

export type EventFeedFilters = {
  type?: string;
  startDate?: string;
  endDate?: string;
};

interface PaginatedEventFeedResponse extends PaginatedResponse {
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

async function fetchEventFeedPage({
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
  if (!response.ok) {
    let message = 'Failed to fetch event feed';
    try {
      const err = await response.json();
      message = err?.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

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
  });
}

async function markEventFeedRead() {
  const response = await fetch('/api/event-feed', {
    method: 'POST',
  });

  if (!response.ok) {
    let message = 'Failed to mark event feed as read';
    try {
      const err = await response.json();
      message = err?.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return response.json() as Promise<{ success: boolean }>;
}

export function useMarkEventFeedRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markEventFeedRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EVENT_FEED_QUERY_KEY],
      });
    },
  });
}
