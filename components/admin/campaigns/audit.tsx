'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { PageLayout } from '@/components/page/layout';
import { LoadMoreButton } from '@/components/shared/load-more-button';
import { INFINITE_SCROLL_CONFIG } from '@/lib/constant';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Eye, BarChart3, Loader2 } from 'lucide-react';
import {
  useInfiniteCampaigns,
  useCampaignStats,
} from '@/lib/hooks/useCampaigns';
import { FormattedDate } from '@/components/formatted-date';

export function CampaignAudit() {
  const [searchTerm, setSearchTerm] = useState('');
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteCampaigns('all', 10, false);

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useCampaignStats('global');

  const campaigns = data?.pages.flatMap((page) => page.campaigns) ?? [];

  // Check if we've reached the auto-scroll limit
  const currentPageCount = data?.pages.length ?? 0;
  const shouldAutoFetch =
    currentPageCount < INFINITE_SCROLL_CONFIG.MAX_AUTO_PAGES;
  const shouldShowLoadMore = !shouldAutoFetch && hasNextPage;

  // Auto-fetch when in view and within limits
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

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PageLayout
      title="Campaign Financial Audit"
      searchPlaceholder="Search campaigns by title or slug"
      onSearchChanged={setSearchTerm}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium tracking-tight">
                Total Campaigns
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (statsData?.totalCampaigns ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All campaigns in system
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium tracking-tight">
                Active Campaigns
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (statsData?.activeCampaigns ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently fundraising
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium tracking-tight">
                Loaded Campaigns
              </h3>
            </div>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently displayed below
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium tracking-tight">
                Pending Approval
              </h3>
            </div>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                statsData?.pendingApprovalCampaigns ?? 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Treasury</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="max-w-[300px] font-medium">
                    <div className="truncate" title={campaign.title}>
                      {campaign.title}
                    </div>
                    <div className="font-mono text-sm text-muted-foreground">
                      {campaign.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        campaign.status === 'ACTIVE'
                          ? 'default'
                          : campaign.status === 'PENDING_APPROVAL'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {campaign.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <FormattedDate date={new Date(campaign.createdAt)} />
                  </TableCell>
                  <TableCell>
                    {campaign.treasuryAddress ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        Deployed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Deployed</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/campaigns/${campaign.slug}`}
                          target="_blank"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/campaigns/${campaign.id}/reconciliation`}
                        >
                          <BarChart3 className="mr-1 h-4 w-4" />
                          Audit
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCampaigns.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm">
                    {searchTerm
                      ? 'No campaigns match your search.'
                      : 'No campaigns found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              Loading more campaigns...
            </span>
          </div>
        )}

        {/* Load more button when auto-fetch limit reached */}
        {shouldShowLoadMore && (
          <LoadMoreButton
            onLoadMore={handleLoadMore}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
          />
        )}

        {/* Intersection observer anchor - only active when auto-fetching */}
        {shouldAutoFetch && <div ref={ref} className="h-10" />}

        {/* Initial Loading State */}
        {isLoading && campaigns.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p>Loading campaigns...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {(error as Error)?.message || 'Failed to load campaigns'}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CampaignAudit;
