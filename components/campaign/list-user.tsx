'use client';

import { useInfiniteUserCampaigns } from '@/lib/hooks/useCampaigns';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { ResponsiveGrid } from '@/components/layout';
import type { CampaignItemProps } from '@/types/campaign';
import { CreateCampaignPlaceholder } from './create-campaign-placeholder';
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
  withRounds = true,
  item: ItemComponent = (props) => <CampaignCard {...props} type="standard" />,
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
    <div className="space-y-6">
      <div className="p-4">
        <ResponsiveGrid variant="cards" gap="md">
          {typeof onCreate === 'function' && (
            <CreateCampaignPlaceholder onCreate={onCreate} />
          )}
          {filteredCampaigns?.map((page) =>
            page.campaigns.map((campaign) => (
              <ItemComponent key={campaign.id} campaign={campaign} />
            )),
          )}
        </ResponsiveGrid>
      </div>
      {/* Loading indicator */}
      {isFetchingNextPage && <CampaignLoading minimal={true} />}

      {/* Intersection observer target */}
      <div ref={ref} className="h-10" />
    </div>
  );
}
