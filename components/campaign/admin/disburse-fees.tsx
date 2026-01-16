'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminDisburseFees } from '@/lib/web3/hooks/useAdminDisburseFees';
import type { DbCampaign } from '@/types/campaign';
import { Banknote } from 'lucide-react';

export function CampaignAdminDisburseFeesButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const { toast } = useToast();
  const { disburseFees, isDisbursing } = useAdminDisburseFees();

  const onDisburseFees = useCallback(async () => {
    if (!campaign.treasuryAddress) {
      toast({
        title: 'Error',
        description: 'No treasury address found for this campaign',
        variant: 'destructive',
      });
      return;
    }

    const result = await disburseFees({ treasuryAddress: campaign.treasuryAddress });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Fees have been disbursed to protocol and platform admins',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to disburse fees',
        variant: 'destructive',
      });
    }
  }, [campaign.treasuryAddress, disburseFees, toast]);

  // Only show for campaigns with treasury
  if (!campaign.treasuryAddress) {
    return null;
  }

  return (
    <Button
      onClick={onDisburseFees}
      className={buttonClassName || 'w-full'}
      disabled={isDisbursing}
      variant="outline"
      title="Disburse accumulated platform and protocol fees from the treasury"
    >
      <Banknote className="mr-2 h-4 w-4" />
      {isDisbursing ? 'Disbursing...' : 'Disburse Fees'}
    </Button>
  );
}
