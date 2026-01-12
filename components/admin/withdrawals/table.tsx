'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useAdminApproveWithdrawal,
  useUpdateAdminWithdrawal,
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
import { ApproveDialog } from '@/components/admin/withdrawals/approve-dialog';
import { RevokeDialog } from '@/components/admin/withdrawals/revoke-dialog';
import { AdminExecuteWithdrawalDialog } from '@/components/admin/withdrawals/admin-execute-withdrawal-dialog';

function StatusBadge({
  approvedById,
  transactionHash,
  requestType,
}: {
  approvedById?: number | null;
  transactionHash?: string | null;
  requestType: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT';
}) {
  // For ON_CHAIN_AUTHORIZATION: Only show Pending/Approved (no execution state)
  // For WITHDRAWAL_AMOUNT: Show Pending, Approved (Not Executed), or Executed
  if (requestType === 'ON_CHAIN_AUTHORIZATION') {
    if (approvedById) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>
      );
    }
    return <Badge variant="secondary">Pending</Badge>;
  }

  // WITHDRAWAL_AMOUNT: Three states
  if (transactionHash) {
    return <Badge className="bg-green-600 hover:bg-green-700">Executed</Badge>;
  }
  if (approvedById) {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-amber-700"
      >
        Approved (Not Executed)
      </Badge>
    );
  }
  return <Badge variant="secondary">Pending</Badge>;
}

function RequestTypeBadge({
  requestType,
}: {
  requestType: 'ON_CHAIN_AUTHORIZATION' | 'WITHDRAWAL_AMOUNT';
}) {
  if (requestType === 'ON_CHAIN_AUTHORIZATION') {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        On-Chain Auth
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-green-50 text-green-700">
      Withdrawal
    </Badge>
  );
}

function CreatorTypeBadge({
  createdBy,
}: {
  createdBy: {
    roles: string[];
  };
}) {
  const isAdminCreated = createdBy.roles.includes('admin');
  if (isAdminCreated) {
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700">
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700">
      User
    </Badge>
  );
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
  const [executeOpen, setExecuteOpen] = useState(false);
  const [executeTarget, setExecuteTarget] =
    useState<AdminWithdrawalListItem | null>(null);

  const approveMutation = useAdminApproveWithdrawal();
  const updateMutation = useUpdateAdminWithdrawal();

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

  const handleExecute = useCallback((w: AdminWithdrawalListItem) => {
    setExecuteTarget(w);
    setExecuteOpen(true);
  }, []);

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
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap">Type</TableHead>
            <TableHead className="hidden whitespace-nowrap md:table-cell">
              Request Creator
            </TableHead>
            <TableHead className="whitespace-nowrap">Amount</TableHead>
            <TableHead className="hidden whitespace-nowrap lg:table-cell">
              Campaign
            </TableHead>
            <TableHead className="hidden whitespace-nowrap lg:table-cell">
              Recipient
            </TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="hidden whitespace-nowrap xl:table-cell">
              Tx Hash
            </TableHead>
            <TableHead className="hidden whitespace-nowrap xl:table-cell">
              Notes
            </TableHead>
            <TableHead className="whitespace-nowrap text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map((w) => {
            const isApproved = Boolean(w.approvedById);
            return (
              <TableRow key={w.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm">{formatDate(w.createdAt)}</div>
                </TableCell>
                <TableCell>
                  <RequestTypeBadge requestType={w.requestType} />
                </TableCell>
                <TableCell className="hidden max-w-[180px] md:table-cell">
                  <div className="space-y-1">
                    <div className="truncate">
                      <Link
                        href={`/admin/users/${w.createdBy.address}`}
                        className="text-sm hover:underline"
                        title={w.createdBy.address}
                      >
                        {w.createdBy.username ||
                          w.createdBy.address.slice(0, 6) +
                            '...' +
                            w.createdBy.address.slice(-4)}
                      </Link>
                    </div>
                    <CreatorTypeBadge createdBy={w.createdBy} />
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {w.requestType === 'ON_CHAIN_AUTHORIZATION' ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="font-medium">
                      {w.amount} {w.token}
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden max-w-[200px] lg:table-cell">
                  <div className="truncate">
                    <Link
                      href={`/campaigns/${w.campaign.slug}`}
                      className="text-sm text-primary hover:underline"
                      title={w.campaign.title}
                    >
                      {w.campaign.title}
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-[200px] lg:table-cell">
                  <div className="space-y-1">
                    <div className="truncate">
                      <Link
                        href={`/admin/users/${w.campaign.creatorAddress}`}
                        className="font-mono text-xs text-primary hover:underline"
                        title={w.campaign.creatorAddress}
                      >
                        {w.campaignCreator?.username ||
                          w.campaign.creatorAddress.slice(0, 8) +
                            '...' +
                            w.campaign.creatorAddress.slice(-6)}
                      </Link>
                    </div>
                    {w.campaignCreator && (
                      <div className="truncate text-xs text-muted-foreground">
                        {w.campaignCreator.firstName ||
                        w.campaignCreator.lastName
                          ? `${w.campaignCreator.firstName || ''} ${w.campaignCreator.lastName || ''}`.trim()
                          : w.campaignCreator.email || null}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    approvedById={w.approvedById}
                    transactionHash={w.transactionHash}
                    requestType={w.requestType}
                  />
                </TableCell>
                <TableCell className="hidden max-w-[180px] xl:table-cell">
                  <div
                    className="truncate"
                    title={w.transactionHash ?? undefined}
                  >
                    {w.transactionHash ? (
                      <span className="font-mono text-xs">
                        {w.transactionHash.slice(0, 10)}...
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-[200px] xl:table-cell">
                  <div
                    className="truncate text-sm"
                    title={w.notes ?? undefined}
                  >
                    {w.notes || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="space-x-1 whitespace-nowrap text-right">
                  <div className="flex flex-wrap items-center justify-end gap-1">
                    {!isApproved &&
                      !w.createdBy.roles?.includes('admin') &&
                      w.requestType === 'WITHDRAWAL_AMOUNT' && (
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog(w)}
                          disabled={busy.approving === w.id}
                          className="text-xs"
                        >
                          Approve
                        </Button>
                      )}
                    {!isApproved &&
                      !w.createdBy.roles?.includes('admin') &&
                      w.requestType === 'ON_CHAIN_AUTHORIZATION' && (
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog(w)}
                          disabled={busy.approving === w.id}
                          className="text-xs"
                        >
                          Approve Auth
                        </Button>
                      )}
                    {!isApproved && w.createdBy.roles?.includes('admin') && (
                      <span className="text-xs text-muted-foreground">
                        Auto-approved
                      </span>
                    )}
                    {/* Show Execute button for approved but not executed withdrawals */}
                    {isApproved &&
                      !w.transactionHash &&
                      w.requestType === 'WITHDRAWAL_AMOUNT' &&
                      w.campaign.treasuryAddress && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleExecute(w)}
                          className="bg-green-600 text-xs hover:bg-green-700"
                        >
                          Execute
                        </Button>
                      )}
                    {/* Revoke enabled for approved but not executed withdrawals */}
                    {isApproved && !w.transactionHash && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRevoke(w)}
                        disabled={busy.updating === w.id}
                        className="text-xs"
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditNotes(w)}
                      disabled={busy.updating === w.id}
                      className="hidden text-xs sm:inline-flex"
                    >
                      Notes
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {withdrawals.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={10} className="py-10 text-center text-sm">
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
        requestType={approveTarget?.requestType}
        title={
          approveTarget?.requestType === 'ON_CHAIN_AUTHORIZATION'
            ? 'Approve Treasury Authorization'
            : 'Approve Withdrawal'
        }
        description={
          approveTarget?.requestType === 'ON_CHAIN_AUTHORIZATION'
            ? 'Click approve to execute the on-chain authorization transaction via MetaMask. This enables withdrawals for the treasury.'
            : 'Click approve to execute the withdrawal transaction via MetaMask. Funds will be sent to the campaign owner.'
        }
        treasuryAddress={approveTarget?.campaign.treasuryAddress ?? null}
        amount={approveTarget?.amount}
        token={approveTarget?.token}
        campaignOwnerAddress={approveTarget?.campaign.creatorAddress}
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
      {executeTarget && executeTarget.campaign.treasuryAddress && (
        <AdminExecuteWithdrawalDialog
          open={executeOpen}
          onOpenChange={(v) => {
            setExecuteOpen(v);
            if (!v) setExecuteTarget(null);
          }}
          campaignId={executeTarget.campaignId}
          campaignTitle={executeTarget.campaign.title}
          campaignOwnerAddress={executeTarget.campaign.creatorAddress}
          treasuryAddress={executeTarget.campaign.treasuryAddress}
          withdrawalId={executeTarget.id}
          amount={executeTarget.amount}
          token={executeTarget.token}
        />
      )}
    </>
  );
}
