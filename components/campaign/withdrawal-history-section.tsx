'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { ArrowDownUp, Filter, Wallet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useInfiniteUserWithdrawals } from '@/lib/hooks/useWithdrawals';
import { WithdrawalHistoryCard } from './withdrawal-history-card';
import {
  getWithdrawalStatus,
  type WithdrawalStatus,
} from './withdrawal-status-badge';
import { CampaignLoading } from './loading';
import { CampaignError } from './error';

type SortOrder = 'newest' | 'oldest';
type StatusFilter = 'all' | WithdrawalStatus;

export function WithdrawalHistorySection() {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserWithdrawals({ pageSize: 10 });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const withdrawals = useMemo(
    () => data?.pages.flatMap((page) => page.withdrawals) || [],
    [data],
  );

  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  const filteredWithdrawals = useMemo(() => {
    if (!withdrawals.length) return [];

    let filtered = [...withdrawals];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (w) => getWithdrawalStatus(w) === statusFilter,
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [withdrawals, statusFilter, sortOrder]);

  const statusCounts = useMemo(() => {
    if (!withdrawals.length) return { pending: 0, approved: 0, executed: 0 };
    return withdrawals.reduce(
      (acc, w) => {
        const status = getWithdrawalStatus(w);
        acc[status]++;
        return acc;
      },
      { pending: 0, approved: 0, executed: 0 },
    );
  }, [withdrawals]);

  if (isLoading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignLoading minimal={true} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignError error={error.message} />
        </CardContent>
      </Card>
    );
  }

  if (totalItems === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              No withdrawals yet
            </h3>
            <p className="mb-6 text-muted-foreground">
              Withdrawal requests from your campaigns will appear here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Your Campaigns
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Withdrawal History</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="h-8 w-40">
                <Filter className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({totalItems})</SelectItem>
                <SelectItem value="pending">
                  Pending ({statusCounts.pending})
                </SelectItem>
                <SelectItem value="approved">
                  Processing ({statusCounts.approved})
                </SelectItem>
                <SelectItem value="executed">
                  Completed ({statusCounts.executed})
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder((prev) =>
                  prev === 'newest' ? 'oldest' : 'newest',
                )
              }
              className="h-8"
            >
              <ArrowDownUp className="mr-2 h-3 w-3" />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredWithdrawals.map((withdrawal) => (
            <WithdrawalHistoryCard
              key={withdrawal.id}
              withdrawal={withdrawal}
            />
          ))}
          {filteredWithdrawals.length === 0 && (
            <p className="py-4 text-center text-muted-foreground">
              No withdrawals match the selected filter.
            </p>
          )}

          {isFetchingNextPage && (
            <div className="py-4">
              <CampaignLoading minimal={true} />
            </div>
          )}

          <div ref={ref} className="h-10" />
        </div>
      </CardContent>
    </Card>
  );
}
