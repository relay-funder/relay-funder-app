'use client';

import { useInfiniteUserCampaigns } from '@/lib/hooks/useCampaigns';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { CampaignItem } from '@/components/campaign/item';
import type { CampaignItemProps } from '@/types/campaign';
import { CampaignCardDashboardCreate } from './card-create';
interface CampaignListProps {
  searchTerm: string;
  categoryFilter?: string | null;
  statusFilter?: string;
  pageSize?: number;
  withRounds?: boolean;
  item?: React.ComponentType<CampaignItemProps>;
  onCreate?: () => Promise<void>;
}

export function CampaignUserList({
  searchTerm,
  categoryFilter,
  statusFilter = undefined,
  pageSize = 10,
  withRounds = false,
  item: ItemComponent = CampaignItem,
  onCreate,
}: CampaignListProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading: loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserCampaigns(statusFilter, pageSize, withRounds);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  if (loading && !data) {
    return <CampaignLoading minimal={true} />;
  }

  if (error) {
    return <CampaignError error={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {typeof onCreate === 'function' && (
          <CampaignCardDashboardCreate onCreate={onCreate} />
        )}
        {filteredCampaigns?.map((page) =>
          page.campaigns.map((campaign) => (
            <ItemComponent key={campaign.id} campaign={campaign} />
          )),
        )}
      </div>
      {/* Loading indicator */}
      {isFetchingNextPage && <CampaignLoading minimal={true} />}

      {/* Intersection observer target */}
      <div ref={ref} className="h-10" />
    </div>
  );
}
