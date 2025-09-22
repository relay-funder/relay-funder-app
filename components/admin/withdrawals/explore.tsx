'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { PageHome } from '@/components/page/home';
import { PageHeaderSearch } from '@/components/page/header-search';
import { useAuth } from '@/contexts';
import {
  useInfiniteAdminWithdrawals,
  useAdminApproveWithdrawal,
  useUpdateAdminWithdrawal,
  useRemoveAdminWithdrawal,
  type AdminWithdrawalsFilters,
  type AdminWithdrawalListItem,
  type AdminWithdrawalsStatus,
} from '@/lib/hooks/useAdminWithdrawals';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

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

function StatusBadge({ approvedById }: { approvedById?: number | null }) {
  if (approvedById) {
    return <Badge>Approved</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type ActionBusy = {
  approving?: number;
  updating?: number;
  deleting?: number;
};

export function WithdrawalsExplore() {
  const { isAdmin } = useAuth();
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

  const [busy, setBusy] = useState<ActionBusy>({});

  const approveMutation = useAdminApproveWithdrawal();
  const updateMutation = useUpdateAdminWithdrawal();
  const removeMutation = useRemoveAdminWithdrawal();

  // Infinite scroll: observe sentinel and load more when visible
  const { ref, inView } = useInView({ rootMargin: '200px' });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleApprove = useCallback(
    async (w: AdminWithdrawalListItem) => {
      if (!isAdmin) return;
      const transactionHash = window.prompt(
        'Enter transaction hash to approve this withdrawal:',
        w.transactionHash ?? '',
      );
      if (!transactionHash) return;
      try {
        setBusy((b) => ({ ...b, approving: w.id }));
        await approveMutation.mutateAsync({
          campaignId: w.campaignId,
          withdrawalId: w.id,
          transactionHash,
          notes: w.notes ?? undefined,
        });
      } catch (e) {
        window.alert((e as Error)?.message ?? 'Failed to approve');
      } finally {
        setBusy((b) => ({ ...b, approving: undefined }));
      }
    },
    [approveMutation, isAdmin],
  );

  const handleRevoke = useCallback(
    async (w: AdminWithdrawalListItem) => {
      if (!isAdmin) return;
      if (!window.confirm('Revoke approval for this withdrawal?')) return;
      try {
        setBusy((b) => ({ ...b, updating: w.id }));
        await updateMutation.mutateAsync({
          id: w.id,
          data: { approvedById: null },
        });
      } catch (e) {
        window.alert((e as Error)?.message ?? 'Failed to revoke');
      } finally {
        setBusy((b) => ({ ...b, updating: undefined }));
      }
    },
    [updateMutation, isAdmin],
  );

  const handleEditTx = useCallback(
    async (w: AdminWithdrawalListItem) => {
      if (!isAdmin) return;
      const nextHash = window.prompt(
        'Update transaction hash:',
        w.transactionHash ?? '',
      );
      if (nextHash === null) return;
      try {
        setBusy((b) => ({ ...b, updating: w.id }));
        await updateMutation.mutateAsync({
          id: w.id,
          data: { transactionHash: nextHash || null },
        });
      } catch (e) {
        window.alert(
          (e as Error)?.message ?? 'Failed to update transaction hash',
        );
      } finally {
        setBusy((b) => ({ ...b, updating: undefined }));
      }
    },
    [updateMutation, isAdmin],
  );

  const handleEditNotes = useCallback(
    async (w: AdminWithdrawalListItem) => {
      if (!isAdmin) return;
      const nextNotes = window.prompt('Update notes:', w.notes ?? '');
      if (nextNotes === null) return;
      try {
        setBusy((b) => ({ ...b, updating: w.id }));
        await updateMutation.mutateAsync({
          id: w.id,
          data: { notes: nextNotes || null },
        });
      } catch (e) {
        window.alert((e as Error)?.message ?? 'Failed to update notes');
      } finally {
        setBusy((b) => ({ ...b, updating: undefined }));
      }
    },
    [updateMutation, isAdmin],
  );

  const handleDelete = useCallback(
    async (w: AdminWithdrawalListItem) => {
      if (!isAdmin) return;
      if (!window.confirm('Delete this withdrawal? This cannot be undone.')) {
        return;
      }
      try {
        setBusy((b) => ({ ...b, deleting: w.id }));
        await removeMutation.mutateAsync({ id: w.id });
      } catch (e) {
        window.alert((e as Error)?.message ?? 'Failed to delete');
      } finally {
        setBusy((b) => ({ ...b, deleting: undefined }));
      }
    },
    [removeMutation, isAdmin],
  );

  return (
    <PageHome
      header={
        <div className="space-y-2">
          <PageHeaderSearch
            placeholder="Search by creator address (0x...) or token symbol"
            onSearchChanged={setSearchTerm}
          />
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
        </div>
      }
    >
      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>You must be an admin to view withdrawals.</CardContent>
        </Card>
      ) : isError ? (
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
          <CardHeader>
            <CardTitle>Withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tx Hash</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(w.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {w.amount} {w.token}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="truncate">
                        <Link
                          href={`/campaigns/${w.campaign.slug}`}
                          className="text-primary hover:underline"
                          title={w.campaign.title}
                        >
                          {w.campaign.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate">
                        <Link
                          href={`/admin/users/${w.createdBy.address}`}
                          className="hover:underline"
                          title={w.createdBy.address}
                        >
                          {w.createdBy.username ||
                            w.createdBy.address.slice(0, 6) +
                              '...' +
                              w.createdBy.address.slice(-4)}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge approvedById={w.approvedById} />
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div
                        className="truncate"
                        title={w.transactionHash ?? undefined}
                      >
                        {w.transactionHash ? (
                          <span className="font-mono text-xs">
                            {w.transactionHash}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <div className="truncate" title={w.notes ?? undefined}>
                        {w.notes || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {w.approvedById ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRevoke(w)}
                          disabled={busy.updating === w.id}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(w)}
                          disabled={busy.approving === w.id}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditTx(w)}
                        disabled={busy.updating === w.id}
                      >
                        Edit Tx
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditNotes(w)}
                        disabled={busy.updating === w.id}
                      >
                        Edit Notes
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(w)}
                        disabled={busy.deleting === w.id}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {withdrawals.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm"
                    >
                      No withdrawals found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Sentinel for infinite auto-fetch */}
            <div ref={ref} className="h-10" />
          </CardContent>
        </Card>
      )}
    </PageHome>
  );
}

export default WithdrawalsExplore;
