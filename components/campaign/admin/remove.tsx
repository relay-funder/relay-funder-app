'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/hooks/use-confirm';
import { Button } from '@/components/ui';
import { useAdminRemoveCampaign } from '@/lib/hooks/useCampaigns';
import { AdminRemoveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Trash2 } from 'lucide-react';

function getRemoveWarningMessage(campaign: DbCampaign): string {
  const isPastStartDate =
    campaign.startTime && new Date(campaign.startTime) < new Date();

  switch (campaign.status) {
    case 'DRAFT':
      return 'Remove this draft campaign? This cannot be undone.';
    case 'PENDING_APPROVAL':
      return isPastStartDate
        ? "This campaign's start date has passed and cannot be approved. Remove it permanently?"
        : 'This campaign is pending approval. Remove it permanently?';
    case 'DISABLED':
      return 'Remove this disabled campaign permanently?';
    case 'COMPLETED':
      return 'Remove this completed campaign? All historical data will be deleted.';
    case 'FAILED':
      return 'Remove this failed campaign permanently?';
    case 'PAUSED':
      return 'Remove this paused campaign permanently?';
    case 'CANCELLED':
      return 'Remove this cancelled campaign permanently?';
    default:
      return 'Remove this campaign permanently? This cannot be undone.';
  }
}

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
  const { confirm } = useConfirm();
  const { mutateAsync: adminRemoveCampaign } = useAdminRemoveCampaign();

  const warningMessage = useMemo(
    () => getRemoveWarningMessage(campaign),
    [campaign],
  );

  const onStateChanged = useCallback(
    (state: keyof typeof AdminRemoveProcessStates) => {
      setProcessState(state);
    },
    [],
  );

  const removeCampaign = useCallback(
    async (campaignToRemove: DbCampaign) => {
      try {
        onStateChanged('setup');
        await adminRemoveCampaign({
          campaignId: campaignToRemove.id,
        });

        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        console.error('Error removing campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to remove campaign',
        );
      }
    },
    [adminRemoveCampaign, onStateChanged],
  );

  const onRemove = useCallback(async () => {
    await confirm({
      title: 'Remove Campaign',
      description: warningMessage,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        setIsLoading(true);
        await removeCampaign(campaign);
        setIsLoading(false);
      },
    });
  }, [confirm, warningMessage, removeCampaign, campaign]);

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

  // Only hide the button for ACTIVE campaigns - they must be disabled first
  if (campaign.status === 'ACTIVE') {
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
