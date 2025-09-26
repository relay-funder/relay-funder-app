'use client';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { CampaignUpdateForm } from '@/components/campaign/update-form';
import { Timeline } from '@/components/timeline';
import { type DbCampaign } from '@/types/campaign';
import { useInfiniteCampaignUpdates } from '@/lib/hooks/useUpdates';

export function CampaignDetailTabUpdates({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCampaignUpdates(campaign.id);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updates = data?.pages.flatMap((page) => page.updates) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      {campaign.creatorAddress && (
        <CampaignUpdateForm creatorAddress={campaign.creatorAddress} />
      )}

      {error ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-100 bg-red-50 py-12 text-center">
            <h3 className="mb-2 text-xl font-semibold text-red-700">
              Unable to load updates
            </h3>
            <p className="text-red-600">
              {error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
      ) : updates.length > 0 ? (
        <>
          <Timeline
            items={updates.map((update) => ({
              ...update,
              id: update.id.toString(),
            }))}
            className="w-full"
          />
          {(isLoading || isFetchingNextPage) && (
            <div className="text-center text-sm text-gray-500">
              Loading updates...
            </div>
          )}
        </>
      ) : isLoading ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-gray-100 bg-gray-50 py-12 text-center">
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              Loading updates...
            </h3>
            <p className="text-gray-500">
              We are fetching the latest updates for this campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            No Updates Yet
          </h3>
          <p className="text-sm text-gray-500">
            Check back later for updates on this campaign&apos;s progress.
          </p>
        </div>
      )}
      {!error && <div ref={ref} className="h-10" />}
    </div>
  );
}
