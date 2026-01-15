'use client';

import { useState, useCallback, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [processState, setProcessState] = useState<'idle' | 'processing' | 'done' | 'failed'>('idle');

  const { toast } = useToast();
  const { claimTip, error } = useAdminClaimTip();

  const onClaimTip = useCallback(async () => {
    if (!campaign.treasuryAddress) {
      toast({
        title: 'Error',
        description: 'No treasury address found for this campaign',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setProcessState('processing');

    try {
      const result = await claimTip({ treasuryAddress: campaign.treasuryAddress });

      if (result.success) {
        setProcessState('done');
      } else {
        setProcessState('failed');
      }
    } catch {
      setProcessState('failed');
    } finally {
      setIsLoading(false);
    }
  }, [campaign.treasuryAddress, claimTip, toast]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description: 'Tips have been claimed successfully',
      });
    }
    if (processState === 'failed') {
      toast({
        title: 'Error',
        description: error || 'Failed to claim tips. Tips may only be available after campaign deadline.',
        variant: 'destructive',
      });
    }
  }, [toast, processState, error]);

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
      disabled={isLoading}
      variant="outline"
      title="Claim accumulated tips from the treasury. Only available after campaign ends."
    >
      <Gift className="mr-2 h-4 w-4" />
      {isLoading ? 'Claiming...' : 'Claim Tips'}
    </Button>
  );
}
