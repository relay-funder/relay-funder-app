'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { RoundLoading } from '@/components/round/loading';
import { RoundError } from '@/components/round/error';
import { RoundCardDashboard } from '@/components/round/card-dashboard';
import { useInfiniteRounds } from '@/lib/hooks/useRounds';
import { RoundItemProps } from '@/types/round';
interface RoundListProps {
  searchTerm: string;
  pageSize?: number;
  item?: React.ComponentType<RoundItemProps>;
}

export function RoundList({
  searchTerm,
  pageSize = 10,
  item: ItemComponent = RoundCardDashboard,
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

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
        {filteredRounds?.map((page) =>
          page.rounds.map((round) => (
            <ItemComponent key={round.id} round={round} />
          )),
        )}
      </div>

      {/* Loading indicator */}
      {isFetchingNextPage && <RoundLoading minimal={true} />}

      {/* Intersection observer target */}
      <div ref={ref} className="h-10" />
    </div>
  );
}
