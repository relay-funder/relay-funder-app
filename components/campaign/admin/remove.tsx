'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminRemoveCampaign } from '@/lib/hooks/useCampaigns';
import { AdminRemoveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Trash2 } from 'lucide-react';

export function CampaignAdminRemoveButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminRemoveProcessStates>('idle');

  const { toast } = useToast();
  const { mutateAsync: adminRemoveCampaign } = useAdminRemoveCampaign();

  const onStateChanged = useCallback(
    (state: keyof typeof AdminRemoveProcessStates) => {
      setProcessState(state);
    },
    [],
  );

  const removeCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onStateChanged('setup');
        await adminRemoveCampaign({
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
    [adminRemoveCampaign, onStateChanged],
  );
  const onRemove = useCallback(async () => {
    setIsLoading(true);
    await removeCampaign(campaign);
    setIsLoading(false);
  }, [removeCampaign, campaign]);

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

  if (
    campaign.status !== 'FAILED' &&
    campaign.status !== 'COMPLETED' &&
    campaign.status !== 'DRAFT'
  ) {
    return null;
  }
  return (
    <Button
      onClick={onRemove}
      className={buttonClassName || 'mt-4 bg-red-600 hover:bg-red-700'}
      disabled={isLoading}
      title="Remove this Campaign from the database"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isLoading ? 'Processing...' : 'Remove'}
    </Button>
  );
}
