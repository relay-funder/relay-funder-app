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
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { PageLayout } from '@/components/page/layout';
import {
  useInfiniteAdminPayments,
  useRetryPledgeExecution,
  type AdminPaymentListItem,
  type AdminPaymentsFilters,
  type PaymentRefundState,
  type PledgeExecutionStatus,
} from '@/lib/hooks/useAdminPayments';
import { FormattedDate } from '@/components/formatted-date';
import { useToast } from '@/hooks/use-toast';

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

function PledgeExecutionBadge({ status }: { status: PledgeExecutionStatus }) {
  switch (status) {
    case 'SUCCESS':
      return (
        <Badge variant="default" className="bg-green-600">
          Executed
        </Badge>
      );
    case 'PENDING':
      return <Badge variant="secondary">Executing...</Badge>;
    case 'FAILED':
      return <Badge variant="destructive">Failed</Badge>;
    case 'NOT_STARTED':
      return <Badge variant="outline">Not Started</Badge>;
    default:
      return null;
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

function PaymentDetailsModal({ payment }: { payment: AdminPaymentListItem }) {
  return (
    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Payment Details - ID: {payment.id}</DialogTitle>
        <DialogDescription>
          Complete information for this payment transaction
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="mb-3 font-semibold">Basic Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Payment ID:</span>
              <div className="font-mono">{payment.id}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <div>
                <FormattedDate date={new Date(payment.createdAt)} />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <div className="font-semibold">
                {payment.amount} {payment.token}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div>
                <StatusBadge status={payment.status} />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Provider:</span>
              <div>
                {payment.provider === 'daimo' ? (
                  <Badge variant="outline" className="bg-blue-50">
                    Daimo Pay
                  </Badge>
                ) : (
                  payment.provider || 'Direct Wallet'
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <div>{payment.type}</div>
            </div>
          </div>
        </div>

        {/* Daimo Pay Specific */}
        {payment.provider === 'daimo' && (
          <div>
            <h3 className="mb-3 font-semibold">Daimo Pay Flow & Status</h3>

            {/* Flow diagram */}
            <div className="mb-4 rounded bg-muted/50 p-3 text-xs">
              <div className="mb-2 font-semibold">Payment Flow:</div>
              <div className="space-y-1 text-muted-foreground">
                <div>1. User pays via Daimo (any chain/token)</div>
                <div>2. Daimo bridges to Celo & transfers to Admin Wallet</div>
                <div>
                  3. Webhook confirms payment →{' '}
                  <Badge variant="outline" className="text-xs">
                    confirmed
                  </Badge>
                </div>
                <div>4. System executes setFeeAndPledge:</div>
                <div className="ml-4">
                  • Transfers funds: Admin Wallet → Campaign Treasury
                </div>
                <div className="ml-4">• Issues NFT to contributor</div>
                <div>
                  5. Status:{' '}
                  <PledgeExecutionBadge
                    status={payment.pledgeExecutionStatus}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Daimo Payment ID:</span>
                <div className="break-all font-mono text-xs">
                  {payment.daimoPaymentId || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Pledge Execution Status:
                </span>
                <div>
                  <PledgeExecutionBadge
                    status={payment.pledgeExecutionStatus}
                  />
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Execution Attempts:
                </span>
                <div>{payment.pledgeExecutionAttempts}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Attempt:</span>
                <div>
                  {payment.pledgeExecutionLastAttempt ? (
                    <FormattedDate
                      date={new Date(payment.pledgeExecutionLastAttempt)}
                    />
                  ) : (
                    'Never'
                  )}
                </div>
              </div>
              {payment.pledgeExecutionTxHash && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">
                    Pledge Transaction Hash:
                  </span>
                  <div className="break-all font-mono text-xs">
                    {payment.pledgeExecutionTxHash}
                  </div>
                </div>
              )}
              {payment.pledgeExecutionError && (
                <div className="col-span-2">
                  <span className="text-destructive text-muted-foreground">
                    Error Message:
                  </span>
                  <div className="mt-1 rounded bg-destructive/10 p-2 text-xs text-destructive">
                    {payment.pledgeExecutionError}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Information */}
        <div>
          <h3 className="mb-3 font-semibold">Contributor</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">User:</span>
              <div>
                <UserLink user={payment.user} />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <div>
                {(payment.metadata as { userEmail?: string })?.userEmail ||
                  'N/A'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Address:</span>
              <div className="break-all font-mono text-xs">
                {payment.user.address}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Anonymous:</span>
              <div>{payment.isAnonymous ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        {/* Campaign Information */}
        <div>
          <h3 className="mb-3 font-semibold">Campaign</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2">
              <span className="text-muted-foreground">Title:</span>
              <div className="mt-1">
                <CampaignLink campaign={payment.campaign} />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Campaign ID:</span>
              <div className="font-mono">{payment.campaignId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Slug:</span>
              <div className="font-mono">{payment.campaign.slug}</div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Public URL:</span>
              <div className="mt-1">
                <a
                  href={`/campaigns/${payment.campaign.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-xs text-blue-600 hover:underline"
                >
                  {typeof window !== 'undefined' ? window.location.origin : ''}
                  /campaigns/{payment.campaign.slug}
                </a>
              </div>
            </div>
            {payment.campaign.treasuryAddress && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Treasury Address:</span>
                <div className="mt-1 break-all font-mono text-xs">
                  {payment.campaign.treasuryAddress}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Round Contribution */}
        {payment.RoundContribution && payment.RoundContribution.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold">Round Contributions</h3>
            <div className="space-y-2">
              {payment.RoundContribution.map((rc) => (
                <div key={rc.id} className="rounded border p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Round:</span>
                      <div>{rc.roundCampaign.Round.title}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Humanity Score:
                      </span>
                      <div>{rc.humanityScore}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refund Information */}
        {payment.refundState !== 'NONE' && (
          <div>
            <h3 className="mb-3 font-semibold">Refund Status</h3>
            <div className="text-sm">
              <RefundBadge state={payment.refundState} />
            </div>
          </div>
        )}

        {/* Transaction Hash */}
        {payment.transactionHash && (
          <div>
            <h3 className="mb-3 font-semibold">Blockchain Transaction</h3>
            <div className="text-sm">
              <span className="text-muted-foreground">Transaction Hash:</span>
              <div className="mt-1 break-all font-mono text-xs">
                {payment.transactionHash}
              </div>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
  const { toast } = useToast();
  const retryMutation = useRetryPledgeExecution();

  const handleRetry = async (paymentId: number) => {
    try {
      await retryMutation.mutateAsync(paymentId);
      toast({
        title: 'Pledge execution retried',
        description: 'The pledge execution has been queued for retry.',
      });
    } catch (error) {
      toast({
        title: 'Retry failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to retry pledge execution',
        variant: 'destructive',
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Contributor</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Round</TableHead>
          <TableHead>Pledge Status</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Refund</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="whitespace-nowrap">
              <FormattedDate date={new Date(p.createdAt)} />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {p.provider === 'daimo' ? (
                <Badge variant="outline" className="bg-blue-50">
                  Daimo Pay
                </Badge>
              ) : p.provider ? (
                <span className="text-sm text-muted-foreground">
                  {p.provider}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Direct</span>
              )}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {p.amount} {p.token}
            </TableCell>
            <TableCell className="max-w-[180px]">
              <div className="truncate">
                <UserLink user={p.user} />
              </div>
            </TableCell>
            <TableCell className="max-w-[200px]">
              <div className="truncate">
                <CampaignLink campaign={p.campaign} />
              </div>
            </TableCell>
            <TableCell className="max-w-[180px]">
              <RoundContributionCell payment={p} />
            </TableCell>
            <TableCell>
              {p.provider === 'daimo' ? (
                <div className="space-y-1">
                  <PledgeExecutionBadge status={p.pledgeExecutionStatus} />
                  {p.pledgeExecutionAttempts > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Attempts: {p.pledgeExecutionAttempts}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={p.status} />
            </TableCell>
            <TableCell>
              <RefundBadge state={p.refundState} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </DialogTrigger>
                  <PaymentDetailsModal payment={p} />
                </Dialog>
                {p.provider === 'daimo' &&
                  p.status === 'confirmed' &&
                  (p.pledgeExecutionStatus === 'FAILED' ||
                    p.pledgeExecutionStatus === 'NOT_STARTED') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(p.id)}
                      disabled={retryMutation.isPending}
                    >
                      {retryMutation.isPending ? 'Retrying...' : 'Retry'}
                    </Button>
                  )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {payments.length === 0 && !isLoading && (
          <TableRow>
            <TableCell colSpan={10} className="py-10 text-center text-sm">
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
    <PageLayout
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
    </PageLayout>
  );
}

export default PaymentsExplore;
