'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminClaimTip } from '@/lib/web3/hooks/useAdminClaimTip';
import type { DbCampaign } from '@/types/campaign';
import { Gift } from 'lucide-react';

export function CampaignAdminClaimTipButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const { toast } = useToast();
  const { claimTip, isClaiming } = useAdminClaimTip();

  const onClaimTip = useCallback(async () => {
    if (!campaign.treasuryAddress) {
      toast({
        title: 'Error',
        description: 'No treasury address found for this campaign',
        variant: 'destructive',
      });
      return;
    }

    const result = await claimTip({ treasuryAddress: campaign.treasuryAddress });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Tips have been claimed successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to claim tips. Tips may only be available after campaign deadline.',
        variant: 'destructive',
      });
    }
  }, [campaign.treasuryAddress, claimTip, toast]);

  // Only show for campaigns with treasury that are completed, failed, or past deadline
  const campaignEndTime = campaign.endTime ? new Date(campaign.endTime).getTime() : 0;
  const isPastDeadline = campaignEndTime > 0 && Date.now() > campaignEndTime;
  const isEligible = campaign.treasuryAddress && (
    campaign.status === 'COMPLETED' ||
    campaign.status === 'FAILED' ||
    isPastDeadline
  );

  if (!isEligible) {
    return null;
  }

  return (
    <Button
      onClick={onClaimTip}
      className={buttonClassName || 'w-full'}
      disabled={isClaiming}
      variant="outline"
      title="Claim accumulated tips from the treasury. Only available after campaign ends."
    >
      <Gift className="mr-2 h-4 w-4" />
      {isClaiming ? 'Claiming...' : 'Claim Tips'}
    </Button>
  );
}
