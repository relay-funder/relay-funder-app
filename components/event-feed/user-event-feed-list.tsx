'use client';

import { useState, useEffect } from 'react';
import {
  useInfiniteEventFeed,
  type EventFeedFilters,
} from '@/lib/hooks/useEventFeed';
import { BaseEventFeedList } from './event-feed-list';
import type { EventFeedListItemData } from './event-feed-list-item';

export type UserEventFeedListProps = {
  className?: string;
  pageSize?: number;
  filters?: EventFeedFilters;
  onSelectItem?: (event: EventFeedListItemData) => void;
  emptyState?: React.ReactNode;
  header?: React.ReactNode;
};

export function UserEventFeedList({
  className,
  pageSize = 10,
  filters,
  onSelectItem,
  emptyState,
  header,
}: UserEventFeedListProps) {
  const [activeFilters, setActiveFilters] = useState<EventFeedFilters>(
    filters ?? {},
  );

  useEffect(() => {
    setActiveFilters(filters ?? {});
  }, [filters]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    refetch,
  } = useInfiniteEventFeed({
    pageSize,
    filters: activeFilters,
  });

  return (
    <BaseEventFeedList
      className={className}
      onSelectItem={onSelectItem}
      emptyState={emptyState}
      header={header}
      data={data}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isPending={isPending}
      isError={isError}
      error={error}
      refetch={refetch}
    />
  );
}

export default UserEventFeedList;
