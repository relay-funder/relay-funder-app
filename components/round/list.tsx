'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect, useCallback } from 'react';
import { RoundLoading } from '@/components/round/loading';
import { RoundError } from '@/components/round/error';
import { RoundCard } from '@/components/round/round-card';
import { useInfiniteRounds } from '@/lib/hooks/useRounds';
import { ResponsiveGrid } from '@/components/layout';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { INFINITE_SCROLL_CONFIG } from '@/lib/constant';
import { RoundItemProps } from '@/types/round';
interface RoundListProps {
  searchTerm: string;
  pageSize?: number;
  item?: React.ComponentType<RoundItemProps>;
}

export function RoundList({
  searchTerm,
  pageSize = 10,
  item: ItemComponent = (props) => <RoundCard {...props} type="standard" />,
}: RoundListProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRounds(pageSize);

  // Check if we've reached the auto-scroll limit
  const currentPageCount = data?.pages.length ?? 0;
  const shouldAutoFetch =
    currentPageCount < INFINITE_SCROLL_CONFIG.MAX_AUTO_PAGES;
  const shouldShowLoadMore = !shouldAutoFetch && hasNextPage;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && shouldAutoFetch) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, shouldAutoFetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Filter rounds based on search term and category
  const filteredRounds = data?.pages.map((page) => ({
    ...page,
    rounds: page.rounds.filter((round) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        round.title?.toLowerCase().includes(searchLower) ||
        round.description?.toLowerCase().includes(searchLower);

      return matchesSearch;
    }),
  }));

  if (loading && !data) {
    return <RoundLoading minimal={true} />;
  }

  if (error) {
    return <RoundError error={error} />;
  }

  return (
    <div className="space-y-6">
      <ResponsiveGrid variant="wide-cards" gap="lg">
        {filteredRounds?.map((page) =>
          page.rounds.map((round) => (
            <ItemComponent key={round.id} round={round} />
          )),
        )}
      </ResponsiveGrid>

      {/* Loading indicator */}
      {isFetchingNextPage && <RoundLoading minimal={true} />}

      {/* Load more button when auto-fetch limit reached */}
      {shouldShowLoadMore && (
        <LoadMoreButton
          onLoadMore={handleLoadMore}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      )}

      {/* Intersection observer target - only active when auto-fetching */}
      {shouldAutoFetch && <div ref={ref} className="h-10" />}
    </div>
  );
}
