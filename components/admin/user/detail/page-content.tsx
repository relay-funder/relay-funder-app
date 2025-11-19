'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { useAdminUserOverview } from '@/lib/hooks/useAdminUserOverview';
import { getDisplayName } from '../types';

// Detail cards
import ProfileCard from './profile-card';
import RecentPaymentsCard from './recent-payments-card';
import PaymentMethodsCard from './payment-methods-card';
import RecentMediaCard from './recent-media-card';
import WithdrawalsCreatedCard from './withdrawals-created-card';
import ApprovalsCard from './approvals-card';
import RecentCommentsCard from './recent-comments-card';
import FavoritesCard from './favorites-card';
import RoundContributionsCard from './round-contributions-card';
import { UserCampaignsCard } from './user-campaigns-card';

export interface AdminUserDetailContentProps {
  address: string;
}

export function AdminUserDetailContent({
  address,
}: AdminUserDetailContentProps) {
  const { data, isLoading, isFetching, error, refetch } =
    useAdminUserOverview(address);

  const displayName = useMemo(() => {
    if (!data?.user) return '—';
    return getDisplayName(data.user);
  }, [data?.user]);

  const encodedAddress = useMemo(() => encodeURIComponent(address), [address]);

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">User Details</h1>
          <div className="mt-1 text-sm">
            <span className="text-muted-foreground">Display name:</span>{' '}
            <span className="font-medium">
              {isLoading ? 'Loading…' : displayName}
            </span>
          </div>
          <div className="mt-1 break-all text-sm text-muted-foreground">
            Address: {address}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/admin/users/${encodedAddress}/edit`}>
            <Button size="lg">Edit User</Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="mb-2 font-medium">Failed to load user overview</div>
          <div className="mb-3 opacity-90">
            {(error as Error)?.message ||
              'An unexpected error occurred while fetching data.'}
          </div>
          <Button variant="destructive" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : null}

      {isLoading && !data ? (
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-md border bg-muted/30" />
          <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
            <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
            <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
            <div className="h-40 animate-pulse rounded-md border bg-muted/30" />
          </div>
        </div>
      ) : null}

      {data ? (
        <>
          <ProfileCard
            user={data.user}
            totalComments={data.totalComments}
            totalFavorites={data.totalFavorites}
            totalRoundContributions={data.totalRoundContributions}
          />

          <UserCampaignsCard campaigns={data.userCampaigns} className="mb-8" />

          <RecentPaymentsCard payments={data.latestPayments} className="mb-8" />

          <PaymentMethodsCard
            paymentMethods={data.latestPaymentMethods}
            className="mb-8"
          />

          <RecentMediaCard media={data.latestMedia} className="mb-8" />

          <WithdrawalsCreatedCard
            withdrawals={data.latestWithdrawalsCreated}
            className="mb-8"
          />

          <ApprovalsCard approvals={data.latestApprovals} className="mb-8" />

          <RecentCommentsCard comments={data.latestComments} className="mb-8" />

          <FavoritesCard favorites={data.latestFavorites} className="mb-8" />

          <RoundContributionsCard
            contributions={data.latestRoundContributions}
            className="mb-8"
          />
        </>
      ) : null}
    </div>
  );
}

export default AdminUserDetailContent;
