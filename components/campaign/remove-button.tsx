'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminRemoveCampaign } from '@/lib/hooks/useCampaigns';
import { AdminRemoveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Loader2, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
export function CampaignRemoveButton({ campaign }: { campaign: DbCampaign }) {
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
    campaign.status !== 'DRAFT' &&
    campaign.status !== 'PENDING_APPROVAL'
  ) {
    return null;
  }
  return (
    <Button
      onClick={onRemove}
      variant="outline"
      size="icon"
      className={cn(
        'rounded-full',
        isLoading && 'opacity-50',
        'mt-4 bg-red-600 hover:bg-red-700',
      )}
      disabled={isLoading}
      title="Remove this Campaign from the database"
    >
      {isLoading ? <Loader2 /> : <Trash />}
    </Button>
  );
}
