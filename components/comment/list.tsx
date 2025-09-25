'use client';
import { useEffect } from 'react';
import { useInfiniteComments } from '@/lib/hooks/useComments';
import { useInView } from 'react-intersection-observer';

import { CommentItem } from './item';
import { type DbCampaign } from '@/types/campaign';
import { CommentLoading } from './loading';
import { CommentError } from './error';
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
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
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

      {/* Intersection observer target */}
      <div ref={ref} className="h-10" />
    </div>
  );
}
