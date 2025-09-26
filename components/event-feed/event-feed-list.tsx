'use client';

import { useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  EventFeedListItem,
  type EventFeedListItemData,
  type EventFeedUser,
} from './event-feed-list-item';
import { PaginatedEventFeedResponse } from '@/lib/hooks/useEventFeed';
import { InfiniteData } from '@tanstack/react-query';

export type BaseEventFeedListProps = {
  className?: string;
  onSelectItem?: (event: EventFeedListItemData) => void;
  emptyState?: React.ReactNode;
  header?: React.ReactNode;
  data?: InfiniteData<PaginatedEventFeedResponse, unknown>;
  fetchNextPage?: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isError: boolean;
  error?: Error | null;
  refetch?: () => void;
};

type UnknownRecord = Record<string, unknown>;

function coerceUser(value: unknown): EventFeedUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const record = value as UnknownRecord;
  if (
    !record ||
    (record.id == null &&
      record.address == null &&
      record.username == null &&
      record.firstName == null &&
      record.lastName == null)
  ) {
    return undefined;
  }

  return {
    id: typeof record.id === 'number' ? record.id : undefined,
    address:
      typeof record.address === 'string' ? (record.address as string) : null,
    username:
      typeof record.username === 'string' ? (record.username as string) : null,
    firstName:
      typeof record.firstName === 'string'
        ? (record.firstName as string)
        : null,
    lastName:
      typeof record.lastName === 'string' ? (record.lastName as string) : null,
    avatarUrl:
      typeof record.avatarUrl === 'string'
        ? (record.avatarUrl as string)
        : null,
  };
}

function mergeEventData(event: EventFeedListItemData): EventFeedListItemData {
  if (!event.data || typeof event.data !== 'object') {
    return event;
  }

  const payload = event.data as UnknownRecord;
  const createdBy =
    event.createdBy ??
    coerceUser(payload.createdBy) ??
    coerceUser(payload.creator);

  const receiver =
    event.receiver ??
    coerceUser(payload.receiver) ??
    coerceUser(payload.recipient);

  const link =
    event.link ??
    (typeof payload.link === 'string'
      ? payload.link
      : typeof payload.url === 'string'
        ? payload.url
        : undefined);

  const linkLabel =
    event.linkLabel ??
    (typeof payload.linkLabel === 'string'
      ? payload.linkLabel
      : typeof payload.label === 'string'
        ? payload.label
        : undefined);

  return {
    ...event,
    createdBy: createdBy ?? event.createdBy,
    receiver: receiver ?? event.receiver,
    link,
    linkLabel,
  };
}

function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={String(index)}
          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 p-10 text-center dark:border-neutral-800">
      <div className="text-sm font-medium text-muted-foreground">
        Nothing to show yet
      </div>
      <p className="mt-1 text-xs text-muted-foreground/80">
        Event feed updates will appear here as soon as they become available.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <div className="font-medium">Unable to load your event feed</div>
      <div className="text-destructive/80">{message}</div>
      <div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

export function BaseEventFeedList({
  className,
  onSelectItem,
  emptyState,
  header,
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isError,
  error,
  refetch,
}: BaseEventFeedListProps) {
  const items = useMemo<EventFeedListItemData[]>(() => {
    const pages = data?.pages ?? [];
    const flattened = pages.flatMap((page) => page.events ?? []);
    return flattened.map((event) =>
      mergeEventData({
        createdAt: event.createdAt,
        type: event.type,
        message: event.message,
        data: event.data,
        createdBy: (event as EventFeedListItemData).createdBy,
        receiver: (event as EventFeedListItemData).receiver,
        link: (event as EventFeedListItemData).link,
        linkLabel: (event as EventFeedListItemData).linkLabel,
      }),
    );
  }, [data]);

  const isEmpty = !isPending && items.length === 0;

  const handleLoadMore = useCallback(() => {
    if (typeof fetchNextPage !== 'function') {
      return;
    }
    if (!isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage]);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {header}

      {isError && error ? (
        <ErrorState message={error?.message} onRetry={() => refetch?.()} />
      ) : null}

      {isPending && items.length === 0 ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((event, index) => (
            <div key={`${event.createdAt}-${index}`} className="flex flex-col">
              <EventFeedListItem
                event={event}
                onSelect={onSelectItem}
                className="w-full"
              />
              {index < items.length - 1 ? (
                <Separator className="mt-5 opacity-50" />
              ) : null}
            </div>
          ))}
        </div>
      )}

      {isEmpty ? (emptyState ?? <DefaultEmptyState />) : null}

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            className="min-w-[160px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more…
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default BaseEventFeedList;
