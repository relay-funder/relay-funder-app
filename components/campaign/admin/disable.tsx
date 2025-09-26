'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminDisableCampaign } from '@/lib/hooks/useCampaigns';
import { AdminDisableProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Pause } from 'lucide-react';

export function CampaignAdminDisableButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminDisableProcessStates>('idle');

  const { toast } = useToast();
  const { mutateAsync: adminDisableCampaign } = useAdminDisableCampaign();

  const onStateChanged = useCallback(
    (state: keyof typeof AdminDisableProcessStates) => {
      setProcessState(state);
    },
    [],
  );

  const disableCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onStateChanged('setup');
        await adminDisableCampaign({
          campaignId: campaign.id,
        });

        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        console.error('Error approving campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to remove campaign',
        );
      }
    },
    [adminDisableCampaign, onStateChanged],
  );
  const onDisable = useCallback(async () => {
    setIsLoading(true);
    await disableCampaign(campaign);
    setIsLoading(false);
  }, [disableCampaign, campaign]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description: 'Campaign has been removed successfully',
      });
    }
    if (processState === 'failed') {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [toast, processState, error]);

  if (campaign.status !== 'ACTIVE') {
    return null;
  }
  return (
    <Button
      onClick={onDisable}
      className={buttonClassName || 'mt-4 bg-red-600 hover:bg-red-700'}
      disabled={isLoading}
      title="Disable this Campaign from the database"
    >
      <Pause className="mr-2 h-4 w-4" />
      {isLoading ? 'Processing...' : 'Disable'}
    </Button>
  );
}
