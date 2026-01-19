'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Eye, BarChart3, Loader2 } from 'lucide-react';
import {
  useInfiniteAdminCampaigns,
  useCampaignStats,
} from '@/lib/hooks/useCampaigns';
import { FormattedDate } from '@/components/formatted-date';
import { StatsCard } from '@/components/admin/stats-card';
import {
  CampaignFiltersModal,
  type AdminCampaignFilters,
} from '../campaign-filters-modal';
import { Button } from '@/components/ui';
import { Filter, X } from 'lucide-react';

export function CampaignAudit() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AdminCampaignFilters>({});
  const { ref, inView } = useInView();

  // Check if any filters are active
  const hasActiveFilters =
    (filters.statuses && filters.statuses.length > 0) ||
    filters.enabled === true ||
    filters.enabled === false ||
    filters.excludeExpiredPending;

  const filterButton = (
    <div className="flex items-center gap-1">
      <CampaignFiltersModal filters={filters} onFiltersChange={setFilters}>
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          className={hasActiveFilters ? 'bg-primary' : ''}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs text-primary">
              {(filters.statuses?.length || 0) +
                (filters.enabled !== null ? 1 : 0) +
                (filters.excludeExpiredPending ? 1 : 0)}
            </span>
          )}
        </Button>
      </CampaignFiltersModal>
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({})}
          className="h-8 px-2 text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteAdminCampaigns(filters, 10, false, true); // includeTips=true for financial audit

  const { data: statsData, isLoading: statsLoading } =
    useCampaignStats('global');

  const campaigns = useMemo(
    () => data?.pages.flatMap((page) => page.campaigns) ?? [],
    [data?.pages],
  );

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

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.slug.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [campaigns, searchTerm],
  );

  return (
    <PageLayout
      title="Campaign Financial Audit"
      searchPlaceholder="Search campaigns by title or slug"
      onSearchChanged={setSearchTerm}
      searchButtons={filterButton}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Campaigns"
            value={
              statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (statsData?.totalCampaigns ?? 0)
              )
            }
            description="All campaigns in system"
            isLoading={statsLoading}
          />

          <StatsCard
            title="Active Campaigns"
            value={
              statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (statsData?.activeCampaigns ?? 0)
              )
            }
            description="Currently fundraising"
            isLoading={statsLoading}
          />

          <StatsCard
            title="Loaded Campaigns"
            value={campaigns.length}
            description="Currently displayed below"
          />

          <StatsCard
            title="Pending Approval"
            value={
              statsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (statsData?.pendingApprovalCampaigns ?? 0)
              )
            }
            description="Awaiting review"
            isLoading={statsLoading}
          />
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
                <TableHead>Withdrawals</TableHead>
                <TableHead>Volume (incl. tips)</TableHead>
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
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(campaign.startTime).toLocaleDateString()} -{' '}
                      {new Date(campaign.endTime).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                      {campaign.status === 'PENDING_APPROVAL' &&
                        new Date(campaign.startTime) < new Date() && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                    </div>
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
                    {campaign.treasuryAddress &&
                    (campaign.status === 'ACTIVE' ||
                      campaign.status === 'COMPLETED' ||
                      campaign.status === 'FAILED') ? (
                      campaign.treasuryWithdrawalsEnabled ? (
                        <Badge className="bg-green-600 hover:bg-green-700">
                          Authorized
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-muted/50 text-muted-foreground"
                        >
                          Not Authorized
                        </Badge>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">
                      {(() => {
                        // Calculate total confirmed amount (includes tips for financial audit) across all tokens
                        const totalConfirmed = campaign.paymentSummary?.token
                          ? Object.values(campaign.paymentSummary.token).reduce(
                              (sum, tokenData) =>
                                sum + (tokenData.confirmed || 0),
                              0,
                            )
                          : 0;
                        return `$${totalConfirmed.toFixed(2)}`;
                      })()}
                    </div>
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
                  <TableCell colSpan={7} className="py-10 text-center text-sm">
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
