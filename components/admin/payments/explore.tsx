'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
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
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { UnifiedLayout } from '@/components/page/unified-layout';
import {
  useInfiniteAdminPayments,
  type AdminPaymentListItem,
  type AdminPaymentsFilters,
  type PaymentRefundState,
} from '@/lib/hooks/useAdminPayments';
import { FormattedDate } from '@/components/formatted-date';

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === 'confirmed' || s === 'completed') {
    return <Badge>Confirmed</Badge>;
  }
  if (s === 'pending') {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (s === 'failed' || s === 'canceled' || s === 'cancelled') {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function RefundBadge({ state }: { state: PaymentRefundState }) {
  switch (state) {
    case 'NONE':
      return <Badge variant="secondary">No Refund</Badge>;
    case 'REQUESTED':
      return <Badge>Refund Requested</Badge>;
    case 'APPROVED':
      return <Badge>Refund Approved</Badge>;
    case 'PROCESSED':
      return <Badge>Refund Processed</Badge>;
    default:
      return <Badge variant="secondary">{state}</Badge>;
  }
}

function UserLink({ user }: { user: AdminPaymentListItem['user'] }) {
  const label =
    user.username || user.address.slice(0, 6) + '...' + user.address.slice(-4);
  return (
    <Link
      href={`/admin/users/${user.address}`}
      className="hover:underline"
      title={user.address}
    >
      {label}
    </Link>
  );
}

function CampaignLink({
  campaign,
}: {
  campaign: AdminPaymentListItem['campaign'];
}) {
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="text-primary hover:underline"
      title={campaign.title}
    >
      {campaign.title}
    </Link>
  );
}

function RoundContributionCell({ payment }: { payment: AdminPaymentListItem }) {
  const count = payment.RoundContribution?.length ?? 0;
  if (!count) {
    return <span className="text-muted-foreground">—</span>;
  }
  const first = payment.RoundContribution[0];
  const round = first?.roundCampaign?.Round;
  if (!round) {
    return <span>{count} linked</span>;
  }
  return (
    <div className="flex flex-col">
      <Link
        href={`/admin/rounds/${round.id}`}
        className="hover:underline"
        title={round.title}
      >
        {round.title}
      </Link>
      {count > 1 && (
        <span className="text-xs text-muted-foreground">+{count - 1} more</span>
      )}
    </div>
  );
}

export type PaymentsTableProps = {
  payments: AdminPaymentListItem[];
  isLoading?: boolean;
};

function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Contributor</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Round Contribution</TableHead>
          <TableHead>Refund</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="whitespace-nowrap">
              <FormattedDate date={new Date(p.createdAt)} />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {p.amount} {p.token}
            </TableCell>
            <TableCell className="max-w-[220px]">
              <div className="truncate">
                <UserLink user={p.user} />
              </div>
            </TableCell>
            <TableCell className="max-w-[260px]">
              <div className="truncate">
                <CampaignLink campaign={p.campaign} />
              </div>
            </TableCell>
            <TableCell className="max-w-[260px]">
              <RoundContributionCell payment={p} />
            </TableCell>
            <TableCell>
              <RefundBadge state={p.refundState} />
            </TableCell>
            <TableCell>
              <StatusBadge status={p.status} />
            </TableCell>
          </TableRow>
        ))}
        {payments.length === 0 && !isLoading && (
          <TableRow>
            <TableCell colSpan={7} className="py-10 text-center text-sm">
              No payments found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

type PaymentStatusFilter =
  | 'ALL'
  | 'pending'
  | 'confirmed'
  | 'failed'
  | 'canceled';

type RefundFilter = 'ALL' | PaymentRefundState;

function useDerivedFilters(
  term: string,
  status: PaymentStatusFilter,
  refund: RefundFilter,
): AdminPaymentsFilters {
  return useMemo(() => {
    const next: AdminPaymentsFilters = {};
    const value = term.trim();

    // Interpret search term:
    // - 0x... -> userAddress
    // - numeric string -> campaignId
    // - otherwise -> token
    if (value) {
      if (value.startsWith('0x') && value.length >= 6) {
        next.userAddress = value;
      } else if (/^\d+$/.test(value)) {
        next.campaignId = Number(value);
      } else {
        next.token = value;
      }
    }

    if (status && status !== 'ALL') {
      next.status = status;
    }

    if (refund && refund !== 'ALL') {
      next.refundState = refund;
    }

    return next;
  }, [term, status, refund]);
}

export function PaymentsExplore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<PaymentStatusFilter>('ALL');
  const [refund, setRefund] = useState<RefundFilter>('ALL');

  const filters = useDerivedFilters(searchTerm, status, refund);
  const pageSize = 10;

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteAdminPayments({ pageSize, filters });

  const payments: AdminPaymentListItem[] = useMemo(
    () => data?.pages.flatMap((p) => p.payments) ?? [],
    [data],
  );

  const { ref, inView } = useInView({ rootMargin: '200px' });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <UnifiedLayout
      title="Payments"
      searchPlaceholder="Search by user (0x...), campaign id, or token"
      onSearchChanged={setSearchTerm}
    >
      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Error loading payments</CardTitle>
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
                  onValueChange={(v) => setStatus(v as PaymentStatusFilter)}
                >
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Refund</span>
                <Select
                  value={refund}
                  onValueChange={(v) => setRefund(v as RefundFilter)}
                >
                  <SelectTrigger className="h-8 w-44">
                    <SelectValue placeholder="Refund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="NONE">No Refund</SelectItem>
                    <SelectItem value="REQUESTED">Requested</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PROCESSED">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <PaymentsTable payments={payments} isLoading={isLoading} />
            {/* Sentinel for infinite auto-fetch */}
            <div ref={ref} className="h-10" />
          </CardContent>
        </Card>
      )}
    </UnifiedLayout>
  );
}

export default PaymentsExplore;
