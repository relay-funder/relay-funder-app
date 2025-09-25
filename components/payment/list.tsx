'use client';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { type DbCampaign } from '@/types/campaign';
import { PaymentItem } from './item';
import { PaymentEmpty } from './empty';
import { useInfinitePayments } from '@/lib/hooks/usePayments';
import { PaymentLoading } from './loading';
import { PaymentError } from './error';
export function PaymentList({ campaign }: { campaign: DbCampaign }) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePayments(campaign.id);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  if (loading && !data) {
    return <PaymentLoading />;
  }

  if (error) {
    return <PaymentError error={error} />;
  }
  if (data?.pages.length === 0) {
    return <PaymentEmpty />;
  }
  return (
    <div className="divide-y divide-gray-100">
      {data?.pages.map((page) =>
        page.payments.map((payment) => (
          <PaymentItem key={payment.id} payment={payment} campaign={campaign} />
        )),
      )}
      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="p-4">
          <PaymentLoading />
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={ref} className="h-4" />
    </div>
  );
}
