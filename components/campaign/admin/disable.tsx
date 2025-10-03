'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import {
  useAdminDisableCampaign,
  useAdminEnableCampaign,
} from '@/lib/hooks/useCampaigns';
import { AdminDisableProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Pause, Play } from 'lucide-react';

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
  const { mutateAsync: adminEnableCampaign } = useAdminEnableCampaign();

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
        console.error('Error disabling campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to disable campaign',
        );
      }
    },
    [adminDisableCampaign, onStateChanged],
  );

  const enableCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onStateChanged('setup');
        await adminEnableCampaign({
          campaignId: campaign.id,
        });

        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        console.error('Error enabling campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to enable campaign',
        );
      }
    },
    [adminEnableCampaign, onStateChanged],
  );

  const onDisable = useCallback(async () => {
    setIsLoading(true);
    await disableCampaign(campaign);
    setIsLoading(false);
  }, [disableCampaign, campaign]);

  const onEnable = useCallback(async () => {
    setIsLoading(true);
    await enableCampaign(campaign);
    setIsLoading(false);
  }, [enableCampaign, campaign]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description:
          campaign.status === 'ACTIVE'
            ? 'Campaign has been disabled successfully'
            : 'Campaign has been enabled successfully',
      });
    }
    if (processState === 'failed') {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [toast, processState, error, campaign.status]);

  // Show disable button for active campaigns
  if (campaign.status === 'ACTIVE') {
    return (
      <Button
        onClick={onDisable}
        size="sm"
        className={buttonClassName || 'mt-4 bg-red-600 hover:bg-red-700'}
        disabled={isLoading}
        title="Disable this Campaign"
      >
        <Pause className="mr-2 h-3 w-3" />
        {isLoading ? 'Processing...' : 'Disable'}
      </Button>
    );
  }

  // Show enable button for disabled campaigns
  if (
    campaign.status === 'DISABLED' ||
    campaign.status === 'PENDING_APPROVAL'
  ) {
    return (
      <Button
        onClick={onEnable}
        size="sm"
        className={buttonClassName || 'mt-4 bg-green-600 hover:bg-green-700'}
        disabled={isLoading}
        title="Re-enable this Campaign"
      >
        <Play className="mr-2 h-3 w-3" />
        {isLoading ? 'Processing...' : 'Enable'}
      </Button>
    );
  }

  return null;
}
