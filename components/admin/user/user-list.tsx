'use client';

import { useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { useInfiniteAdminUsers } from '@/lib/hooks/useAdminUsers';
import UserCard from './user-card';
import UserListLoading from './user-list-loading';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { INFINITE_SCROLL_CONFIG } from '@/lib/constant';
import { GetUserResponseInstance } from '@/lib/api/types';

export type UserListProps = {
  name: string;
  pageSize?: number;
  className?: string;
  gridClassName?: string;
  cardClassName?: string;
  emptyState?: ReactNode;
  onUserClick?: (user: GetUserResponseInstance) => void;
  /**
   * If true, automatically fetch next page when the sentinel enters view.
   * Disable to manage pagination externally.
   */
  enableAutoFetch?: boolean;
};

export function UserList({
  name,
  pageSize = 10,
  className,
  gridClassName,
  cardClassName,
  emptyState,
  onUserClick,
  enableAutoFetch = true,
}: UserListProps) {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteAdminUsers({ name, pageSize });

  const users = useMemo(
    () => data?.pages.flatMap((page) => page.users) ?? [],
    [data],
  );

  // Check if we've reached the auto-scroll limit
  const currentPageCount = data?.pages.length ?? 0;
  const shouldAutoFetch =
    enableAutoFetch && currentPageCount < INFINITE_SCROLL_CONFIG.MAX_AUTO_PAGES;
  const shouldShowLoadMore = !shouldAutoFetch && hasNextPage;

  useEffect(() => {
    if (!enableAutoFetch) {
      return;
    }
    if (inView && hasNextPage && !isFetchingNextPage && shouldAutoFetch) {
      fetchNextPage();
    }
  }, [
    enableAutoFetch,
    inView,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    shouldAutoFetch,
  ]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCardClick = useCallback(
    (user: GetUserResponseInstance) => {
      onUserClick?.(user);
    },
    [onUserClick],
  );

  if (isLoading && users.length === 0) {
    return <UserListLoading />;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {(error as Error)?.message || 'Failed to load users'}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
          gridClassName,
        )}
      >
        {users.map((user, index) => (
          <UserCard
            key={`${index}-${user.id}`}
            user={user}
            className={cardClassName}
            onClick={onUserClick ? () => handleCardClick(user) : undefined}
          />
        ))}
      </div>

      {users.length === 0 && !isLoading && !isError && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {emptyState ?? 'No users found'}
        </div>
      )}

      {isFetchingNextPage && <UserListLoading minimal />}

      {/* Load more button when auto-fetch limit reached */}
      {shouldShowLoadMore && (
        <LoadMoreButton
          onLoadMore={handleLoadMore}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      )}

      {/* Intersection observer anchor - only active when auto-fetching */}
      {shouldAutoFetch && <div ref={ref} className="h-10" />}
    </div>
  );
}

export default UserList;
