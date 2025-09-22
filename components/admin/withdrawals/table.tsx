'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useAdminApproveWithdrawal,
  useUpdateAdminWithdrawal,
  useRemoveAdminWithdrawal,
  type AdminWithdrawalListItem,
} from '@/lib/hooks/useAdminWithdrawals';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Trash as TrashIcon } from 'lucide-react';
import { ApproveDialog } from '@/components/admin/withdrawals/approve-dialog';
import { RevokeDialog } from '@/components/admin/withdrawals/revoke-dialog';

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

export type WithdrawalsTableProps = {
  withdrawals: AdminWithdrawalListItem[];
  isLoading?: boolean;
};

export function WithdrawalsTable({
  withdrawals,
  isLoading,
}: WithdrawalsTableProps) {
  const [busy, setBusy] = useState<ActionBusy>({});
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] =
    useState<AdminWithdrawalListItem | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] =
    useState<AdminWithdrawalListItem | null>(null);

  const approveMutation = useAdminApproveWithdrawal();
  const updateMutation = useUpdateAdminWithdrawal();
  const removeMutation = useRemoveAdminWithdrawal();

  const openApproveDialog = useCallback((w: AdminWithdrawalListItem) => {
    setApproveTarget(w);
    setApproveOpen(true);
  }, []);

  const handleApproveConfirm = useCallback(
    async (payload: { transactionHash: string; notes?: string | null }) => {
      const w = approveTarget;
      if (!w) return;
      try {
        setBusy((b) => ({ ...b, approving: w.id }));
        await approveMutation.mutateAsync({
          campaignId: w.campaignId,
          withdrawalId: w.id,
          transactionHash: payload.transactionHash,
          notes: payload.notes ?? undefined,
        });
        setApproveOpen(false);
        setApproveTarget(null);
      } catch (e) {
        window.alert((e as Error)?.message ?? 'Failed to approve');
      } finally {
        setBusy((b) => ({ ...b, approving: undefined }));
      }
    },
    [approveMutation, approveTarget],
  );

  const handleRevoke = useCallback((w: AdminWithdrawalListItem) => {
    setRevokeTarget(w);
    setRevokeOpen(true);
  }, []);

  const handleRevokeConfirm = useCallback(
    async (payload: { notes: string }) => {
      const w = revokeTarget;
      if (!w) return;
      try {
        setBusy((b) => ({ ...b, updating: w.id }));
        await updateMutation.mutateAsync({
          id: w.id,
          data: { approvedById: null, notes: payload.notes },
        });
        setRevokeOpen(false);
        setRevokeTarget(null);
      } catch (e) {
        window.alert((e as Error)?.message ?? 'Failed to revoke');
      } finally {
        setBusy((b) => ({ ...b, updating: undefined }));
      }
    },
    [updateMutation, revokeTarget],
  );

  const handleEditNotes = useCallback(
    async (w: AdminWithdrawalListItem) => {
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
    [updateMutation],
  );

  const handleDelete = useCallback(
    async (w: AdminWithdrawalListItem) => {
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
    [removeMutation],
  );

  const approveDialogDefaults = useMemo(
    () => ({
      tx: approveTarget?.transactionHash ?? '',
      notes: approveTarget?.notes ?? '',
    }),
    [approveTarget],
  );

  return (
    <>
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
          {withdrawals.map((w) => {
            const isApproved = Boolean(w.approvedById);
            return (
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
                  {!isApproved && (
                    <Button
                      size="sm"
                      onClick={() => openApproveDialog(w)}
                      disabled={busy.approving === w.id}
                    >
                      Approve
                    </Button>
                  )}
                  {/* Revoke enabled for both approved and pending states */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRevoke(w)}
                    disabled={busy.updating === w.id}
                  >
                    Revoke
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
                    size="icon"
                    onClick={() => handleDelete(w)}
                    disabled={busy.deleting === w.id}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {withdrawals.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm">
                No withdrawals found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ApproveDialog
        open={approveOpen}
        onOpenChange={(v) => {
          setApproveOpen(v);
          if (!v) setApproveTarget(null);
        }}
        onConfirm={handleApproveConfirm}
        defaultTransactionHash={approveDialogDefaults.tx}
        defaultNotes={approveDialogDefaults.notes}
        isSubmitting={
          approveTarget ? busy.approving === approveTarget.id : false
        }
      />
      <RevokeDialog
        open={revokeOpen}
        onOpenChange={(v) => {
          setRevokeOpen(v);
          if (!v) setRevokeTarget(null);
        }}
        onConfirm={handleRevokeConfirm}
        defaultNotes={revokeTarget?.notes ?? ''}
        isSubmitting={revokeTarget ? busy.updating === revokeTarget.id : false}
      />
    </>
  );
}
