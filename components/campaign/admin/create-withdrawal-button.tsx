'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { AdminWithdrawalRequestDialog } from '@/components/admin/withdrawals/admin-withdrawal-request-dialog';
import type { DbCampaign } from '@/types/campaign';
import { Wallet } from 'lucide-react';

export function CampaignAdminCreateWithdrawalButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  // Only show if campaign has treasury and withdrawals are enabled
  if (!campaign.treasuryAddress || !campaign.treasuryWithdrawalsEnabled) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={buttonClassName}
        variant="outline"
        size="sm"
      >
        <Wallet className="mr-2 h-3 w-3" />
        Create Withdrawal Request
      </Button>
      <AdminWithdrawalRequestDialog
        open={open}
        onOpenChange={setOpen}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        treasuryAddress={campaign.treasuryAddress}
      />
    </>
  );
}
