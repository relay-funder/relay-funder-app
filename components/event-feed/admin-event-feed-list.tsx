'use client';

import { useState, useEffect } from 'react';
import {
  useInfiniteAdminEventFeed,
  type EventFeedFilters,
} from '@/lib/hooks/useAdminEventFeed';
import { BaseEventFeedList } from './event-feed-list';
import type { EventFeedListItemData } from './event-feed-list-item';

export type AdminEventFeedListProps = {
  className?: string;
  pageSize?: number;
  filters?: EventFeedFilters;
  onSelectItem?: (event: EventFeedListItemData) => void;
  emptyState?: React.ReactNode;
  header?: React.ReactNode;
};

export function AdminEventFeedList({
  className,
  pageSize = 10,
  filters,
  onSelectItem,
  emptyState,
  header,
}: AdminEventFeedListProps) {
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
  } = useInfiniteAdminEventFeed({
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

export default AdminEventFeedList;
