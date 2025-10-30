'use client';

import { useInfiniteCampaigns } from '@/lib/hooks/useCampaigns';
import { useInView } from 'react-intersection-observer';
import { useCallback, useEffect, useState } from 'react';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { CollectionAddDialog } from '@/components/collection/add-dialog';
import { ResponsiveGrid } from '@/components/layout';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { INFINITE_SCROLL_CONFIG } from '@/lib/constant';
import type { DbCampaign, CampaignItemProps } from '@/types/campaign';
interface CampaignListProps {
  searchTerm: string;
  categoryFilter?: string | null;
  statusFilter?: string;
  pageSize?: number;
  withRounds?: boolean;
  item?: React.ComponentType<CampaignItemProps>;
}

export function CampaignList({
  searchTerm,
  categoryFilter,
  statusFilter = undefined,
  pageSize = 10,
  withRounds = false,
  item: ItemComponent = (props) => <CampaignCard {...props} type="standard" />,
}: CampaignListProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCampaigns(statusFilter, pageSize, withRounds);

  // Check if we've reached the auto-scroll limit
  const currentPageCount = data?.pages.length ?? 0;
  const shouldAutoFetch =
    currentPageCount < INFINITE_SCROLL_CONFIG.MAX_AUTO_PAGES;
  const shouldRenderSentinel = shouldAutoFetch && hasNextPage;
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

  // Filter campaigns based on search term and category
  const filteredCampaigns = data?.pages.map((page) => ({
    ...page,
    campaigns: page.campaigns.filter((campaign) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        campaign.title?.toLowerCase().includes(searchLower) ||
        campaign.description?.toLowerCase().includes(searchLower) ||
        campaign.location?.toLowerCase().includes(searchLower);

      // If a category filter is applied, check if the campaign matches
      const matchesCategory =
        !categoryFilter || campaign.category === categoryFilter;

      return matchesSearch && matchesCategory;
    }),
  }));

  const [selectedCampaign, setSelectedCampaign] = useState<DbCampaign | null>(
    null,
  );
  const onSelectIntern = useCallback(async (campaign: DbCampaign) => {
    setSelectedCampaign(campaign);
  }, []);

  if (loading && !data) {
    return <CampaignLoading minimal={true} />;
  }

  if (error) {
    return <CampaignError error={error} />;
  }

  return (
    <div className="space-y-6">
      <ResponsiveGrid variant="cards" gap="md">
        {filteredCampaigns?.map((page) =>
          page.campaigns.map((campaign) => (
            <ItemComponent
              key={campaign.id}
              campaign={campaign}
              onSelect={onSelectIntern}
            />
          )),
        )}
      </ResponsiveGrid>
      {selectedCampaign ? (
        <CollectionAddDialog
          campaign={selectedCampaign}
          onClosed={() => {
            setSelectedCampaign(null);
          }}
        />
      ) : null}
      {/* Loading indicator */}
      {isFetchingNextPage && <CampaignLoading minimal={true} />}

      {/* Load more button when auto-fetch limit reached */}
      {shouldShowLoadMore && (
        <LoadMoreButton
          onLoadMore={handleLoadMore}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      )}

      {/* Intersection observer target - only active when auto-fetching */}
      {shouldRenderSentinel && <div ref={ref} className="h-10" />}
    </div>
  );
}
