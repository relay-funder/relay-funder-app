'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui';
import { AdminExecuteWithdrawalDialog } from '@/components/admin/withdrawals/admin-execute-withdrawal-dialog';
import { useAdminWithdrawals } from '@/lib/hooks/useAdminWithdrawals';
import type { DbCampaign } from '@/types/campaign';
import { Wallet, Loader2 } from 'lucide-react';

export function CampaignAdminExecuteWithdrawalButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<
    number | null
  >(null);

  // Fetch approved withdrawals for this campaign
  const { data: withdrawalsData, isLoading } = useAdminWithdrawals({
    page: 1,
    pageSize: 10,
    filters: {
      campaignId: campaign.id,
      status: 'APPROVED',
      requestType: 'WITHDRAWAL_AMOUNT',
    },
  });

  const approvedWithdrawals = useMemo(() => {
    if (!withdrawalsData) return [];
    // Filter for approved withdrawals that haven't been executed yet
    return withdrawalsData.filter((w) => w.approvedById && !w.transactionHash);
  }, [withdrawalsData]);

  // Only show if campaign has treasury, withdrawals enabled, and there are approved withdrawals
  if (
    !campaign.treasuryAddress ||
    !campaign.treasuryWithdrawalsEnabled ||
    approvedWithdrawals.length === 0
  ) {
    return null;
  }

  // If there's only one approved withdrawal, use it directly
  const withdrawalToExecute = selectedWithdrawalId
    ? approvedWithdrawals.find((w) => w.id === selectedWithdrawalId)
    : approvedWithdrawals[0];

  if (isLoading) {
    return (
      <Button className={buttonClassName} disabled>
        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!withdrawalToExecute) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => {
          setSelectedWithdrawalId(withdrawalToExecute.id);
          setOpen(true);
        }}
        className={buttonClassName}
        variant="default"
      >
        <Wallet className="mr-2 h-3 w-3" />
        Execute Withdrawal
        {approvedWithdrawals.length > 1 && (
          <span className="ml-1 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
            {approvedWithdrawals.length}
          </span>
        )}
      </Button>
      <AdminExecuteWithdrawalDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSelectedWithdrawalId(null);
          }
        }}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        campaignOwnerAddress={campaign.creatorAddress}
        treasuryAddress={campaign.treasuryAddress}
        withdrawalId={withdrawalToExecute.id}
        amount={withdrawalToExecute.amount}
        token={withdrawalToExecute.token}
      />
    </>
  );
}
