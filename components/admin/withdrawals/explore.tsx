'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/page/layout';
import {
  useInfiniteAdminWithdrawals,
  type AdminWithdrawalsFilters,
  type AdminWithdrawalListItem,
  type AdminWithdrawalsStatus,
} from '@/lib/hooks/useAdminWithdrawals';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { WithdrawalsTable } from '@/components/admin/withdrawals/table';

function useDerivedFilters(
  term: string,
  status?: AdminWithdrawalsStatus | 'ALL',
  requestType?: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT' | 'ALL',
  createdByType?: 'admin' | 'user' | 'ALL',
): AdminWithdrawalsFilters {
  return useMemo(() => {
    const next: AdminWithdrawalsFilters = {};
    const value = term.trim();
    if (value) {
      if (value.startsWith('0x') && value.length >= 6) {
        next.createdByAddress = value;
      } else {
        next.token = value;
      }
    }
    if (status && status !== 'ALL') {
      next.status = status;
    }
    if (requestType && requestType !== 'ALL') {
      next.requestType = requestType;
    }
    if (createdByType && createdByType !== 'ALL') {
      next.createdByType = createdByType;
    }
    return next;
  }, [term, status, requestType, createdByType]);
}

export function WithdrawalsExplore() {
  const searchParams = useSearchParams();
  const campaignIdParam = searchParams.get('campaignId');
  const campaignId = campaignIdParam
    ? parseInt(campaignIdParam, 10)
    : undefined;

  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<AdminWithdrawalsStatus | 'ALL'>(
    'ALL', // Show all withdrawals by default (both pending and approved)
  );
  const [requestType, setRequestType] = useState<
    'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT' | 'ALL'
  >('ALL');
  const [createdByType, setCreatedByType] = useState<'admin' | 'user' | 'ALL'>(
    'ALL',
  );

  const baseFilters = useDerivedFilters(
    searchTerm,
    status,
    requestType,
    createdByType,
  );
  const filters = useMemo(() => {
    const result = { ...baseFilters };
    if (campaignId && !isNaN(campaignId)) {
      result.campaignId = campaignId;
    }
    return result;
  }, [baseFilters, campaignId]);
  const pageSize = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteAdminWithdrawals({ pageSize, filters });

  const withdrawals: AdminWithdrawalListItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.withdrawals) ?? [],
    [data],
  );

  // Infinite scroll: observe sentinel and load more when visible
  const { ref, inView } = useInView({ rootMargin: '200px' });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PageLayout
      title="Withdrawals"
      searchPlaceholder="Search by creator address (0x...) or token symbol"
      onSearchChanged={setSearchTerm}
    >
      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Error loading withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {(error as Error)?.message ?? 'An unexpected error occurred.'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status</span>
                <Select
                  value={status}
                  onValueChange={(v) =>
                    setStatus(v as AdminWithdrawalsStatus | 'ALL')
                  }
                >
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Type</span>
                <Select
                  value={requestType}
                  onValueChange={(v) =>
                    setRequestType(
                      v as
                        | 'ON_CHAIN_AUTHORIZATION'
                        | 'WITHDRAWAL_AMOUNT'
                        | 'ALL',
                    )
                  }
                >
                  <SelectTrigger className="h-8 w-48">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="ON_CHAIN_AUTHORIZATION">
                      On-Chain Auth
                    </SelectItem>
                    <SelectItem value="WITHDRAWAL_AMOUNT">
                      Withdrawal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Creator</span>
                <Select
                  value={createdByType}
                  onValueChange={(v) =>
                    setCreatedByType(v as 'admin' | 'user' | 'ALL')
                  }
                >
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Creator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <WithdrawalsTable
                  withdrawals={withdrawals}
                  isLoading={isLoading}
                />
              </div>
            </div>
            {/* Sentinel for infinite auto-fetch */}
            <div ref={ref} className="h-10" />
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
