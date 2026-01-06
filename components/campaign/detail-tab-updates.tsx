'use client';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { CampaignUpdateModal } from '@/components/campaign/campaign-card/campaign-update-modal';
import { Timeline } from '@/components/timeline';
import { Button } from '@/components/ui/button';
import { type DbCampaign } from '@/types/campaign';
import { useInfiniteCampaignUpdates } from '@/lib/hooks/useUpdates';
import { useAuth } from '@/contexts/AuthContext';

export function CampaignDetailTabUpdates({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { ref, inView } = useInView();
  const { address } = useAuth();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCampaignUpdates(campaign.id);

  const isOwner =
    address &&
    campaign.creatorAddress &&
    address.toLowerCase() === campaign.creatorAddress.toLowerCase();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updates = useMemo(() => {
    return data?.pages.flatMap((page) => page.updates) ?? [];
  }, [data?.pages]);

  const timelineItems = useMemo(
    () =>
      updates.map((update) => ({
        ...update,
        campaignId: campaign.id,
        media: update.mediaOrder
          ? update.mediaOrder
              .map((mediaId) =>
                update.media?.find((media) => media.id === mediaId),
              )
              .filter((media) => typeof media !== 'undefined')
          : [],
      })),
    [updates, campaign],
  );

  return (
    <div className="max-w-3xl space-y-6">
      {error ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 py-12 text-center">
            <h3 className="mb-2 font-display text-xl font-semibold text-destructive">
              Unable to load updates
            </h3>
            <p className="text-destructive/80">
              {error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
      ) : updates.length > 0 ? (
        <>
          {isOwner && (
            <div className="flex justify-start">
              <Button
                onClick={() => setIsUpdateModalOpen(true)}
                variant="outline"
              >
                Post Update
              </Button>
            </div>
          )}
          <Timeline
            items={timelineItems}
            className="w-full"
            creatorAddress={campaign.creatorAddress}
            campaignId={campaign.id}
          />
          {(isLoading || isFetchingNextPage) && (
            <div className="text-center text-sm text-gray-500">
              Loading updates...
            </div>
          )}
        </>
      ) : isLoading ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-border bg-card py-12 text-center">
            <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
              Loading updates...
            </h3>
            <p className="text-muted-foreground">
              We are fetching the latest updates for this campaign.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
            No Updates Yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Check back later for updates on this campaign&apos;s progress.
          </p>
          {isOwner && (
            <div className="mt-6">
              <Button
                onClick={() => setIsUpdateModalOpen(true)}
                variant="outline"
                size="lg"
              >
                Post Update
              </Button>
            </div>
          )}
        </div>
      )}

      {!error && <div ref={ref} className="h-10" />}

      {isOwner && (
        <CampaignUpdateModal
          campaign={campaign}
          open={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
        />
      )}
    </div>
  );
}
