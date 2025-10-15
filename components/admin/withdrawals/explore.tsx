'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
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
    return next;
  }, [term, status]);
}

export function WithdrawalsExplore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<AdminWithdrawalsStatus | 'ALL'>(
    'PENDING',
  );

  const filters = useDerivedFilters(searchTerm, status);
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
            <div className="flex items-center gap-2 border-b pb-3">
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
            <WithdrawalsTable withdrawals={withdrawals} isLoading={isLoading} />
            {/* Sentinel for infinite auto-fetch */}
            <div ref={ref} className="h-10" />
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
