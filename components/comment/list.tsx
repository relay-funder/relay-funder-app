'use client';
import { useEffect, useCallback } from 'react';
import { useInfiniteComments } from '@/lib/hooks/useComments';
import { useInView } from 'react-intersection-observer';

import { CommentItem } from './item';
import { type DbCampaign } from '@/types/campaign';
import { CommentLoading } from './loading';
import { CommentError } from './error';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { INFINITE_SCROLL_CONFIG } from '@/lib/constant';
export function CommentList({ campaign }: { campaign: DbCampaign }) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteComments(campaign.id);

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
  if (loading && !data) {
    return <CommentLoading expectItemCount={2} />;
  }

  if (error) {
    return <CommentError error={error} />;
  }
  return (
    <div className="space-y-4">
      {data?.pages.map((page) =>
        page.comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} campaign={campaign} />
        )),
      )}
      {/* Loading indicator */}
      {isFetchingNextPage && <CommentLoading expectItemCount={1} />}

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
