'use client';

import { useState, useCallback, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [processState, setProcessState] = useState<'idle' | 'processing' | 'done' | 'failed'>('idle');

  const { toast } = useToast();
  const { disburseFees, error } = useAdminDisburseFees();

  const onDisburseFees = useCallback(async () => {
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
      const result = await disburseFees({ treasuryAddress: campaign.treasuryAddress });

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
  }, [campaign.treasuryAddress, disburseFees, toast]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description: 'Fees have been disbursed to protocol and platform admins',
      });
    }
    if (processState === 'failed') {
      toast({
        title: 'Error',
        description: error || 'Failed to disburse fees',
        variant: 'destructive',
      });
    }
  }, [toast, processState, error]);

  // Only show for campaigns with treasury that have received donations
  if (!campaign.treasuryAddress) {
    return null;
  }

  return (
    <Button
      onClick={onDisburseFees}
      className={buttonClassName || 'w-full'}
      disabled={isLoading}
      variant="outline"
      title="Disburse accumulated platform and protocol fees from the treasury"
    >
      <Banknote className="mr-2 h-4 w-4" />
      {isLoading ? 'Disbursing...' : 'Disburse Fees'}
    </Button>
  );
}
