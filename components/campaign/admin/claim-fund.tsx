'use client';

import { useCallback } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { TREASURY_DELAYS } from '@/lib/constant/treasury';
import { useAdminClaimFund } from '@/lib/web3/hooks/useAdminClaimFund';
import type { DbCampaign } from '@/types/campaign';

export function CampaignAdminClaimFundButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const { toast } = useToast();
  const { claimFund, isClaiming } = useAdminClaimFund();

  const onClaimFund = useCallback(async () => {
    if (!campaign.treasuryAddress) {
      toast({
        title: 'Error',
        description: 'No treasury address found for this campaign',
        variant: 'destructive',
      });
      return;
    }

    const result = await claimFund({
      treasuryAddress: campaign.treasuryAddress,
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Remaining campaign funds have been claimed',
      });
      return;
    }

    toast({
      title: 'Error',
      description:
        result.error ||
        'Failed to claim funds. Funds become claimable after the withdrawal window expires.',
      variant: 'destructive',
    });
  }, [campaign.treasuryAddress, claimFund, toast]);

  const campaignEndTime = campaign.endTime
    ? new Date(campaign.endTime).getTime()
    : 0;
  const claimableAfterDeadline =
    campaignEndTime > 0 &&
    Date.now() >
      campaignEndTime + TREASURY_DELAYS.WITHDRAWAL_DELAY * 1000;
  const isEligible =
    !!campaign.treasuryAddress &&
    (campaign.status === 'CANCELLED' || claimableAfterDeadline);

  if (!isEligible) {
    return null;
  }

  return (
    <Button
      onClick={onClaimFund}
      className={buttonClassName || 'w-full'}
      disabled={isClaiming}
      variant="outline"
      title="Claim remaining campaign funds to the platform admin after the withdrawal window expires."
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isClaiming ? 'Claiming...' : 'Claim Fund'}
    </Button>
  );
}
