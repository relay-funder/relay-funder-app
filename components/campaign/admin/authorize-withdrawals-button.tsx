'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { OnChainAuthDialog } from '@/components/admin/withdrawals/on-chain-auth-dialog';
import type { DbCampaign } from '@/types/campaign';
import { CheckCircle2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { CAMPAIGNS_QUERY_KEY, resetCampaign } from '@/lib/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';

export function CampaignAdminAuthorizeWithdrawalsButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Only show if campaign has treasury but withdrawals are not enabled
  if (!campaign.treasuryAddress || campaign.treasuryWithdrawalsEnabled) {
    return null;
  }

  // Only show for active/completed/failed campaigns
  if (
    campaign.status !== 'ACTIVE' &&
    campaign.status !== 'COMPLETED' &&
    campaign.status !== 'FAILED'
  ) {
    return null;
  }

  const handleSuccess = () => {
    resetCampaign(campaign.id, queryClient);
    toast({
      title: 'Treasury authorized',
      description: 'Withdrawals are now enabled for this treasury.',
    });
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={buttonClassName}
        variant="outline"
        size="sm"
      >
        <CheckCircle2 className="mr-2 h-3 w-3" />
        Authorize Withdrawals
      </Button>
      {campaign.treasuryAddress && (
        <OnChainAuthDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={handleSuccess}
          treasuryAddress={campaign.treasuryAddress}
          campaignTitle={campaign.title}
          campaignId={campaign.id}
        />
      )}
    </>
  );
}
