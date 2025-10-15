'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import {
  useCreateCampaignContract,
  IOnCreateCampaignConfirmed,
} from '@/lib/web3/hooks/useCreateCampaignContract';
import type { DbCampaign } from '@/types/campaign';
import { CreateProcessStates } from '@/types/campaign';
import { Wallet } from 'lucide-react';

export function CampaignAdminDeployButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof CreateProcessStates>('idle');

  const { toast } = useToast();

  const onStateChanged = useCallback(
    (state: keyof typeof CreateProcessStates) => {
      setProcessState(state);
    },
    [],
  );
  const { mutateAsync: updateCampaign } = useUpdateCampaign();

  const onUpdateCampaingToPendingApproval = useCallback(
    async ({
      hash,
      status,
      campaignAddress,
      campaignId,
    }: IOnCreateCampaignConfirmed) => {
      try {
        if (status === 'success') {
          // First update the campaign status to pending_approval
          await updateCampaign({
            campaignId,
            transactionHash: hash,
            status: 'pending_approval',
            campaignAddress,
          });
          onStateChanged('done');
        } else {
          onStateChanged('failed');
          setError('Failed to deploy campaign: Unknown Error');
        }
      } catch (error) {
        onStateChanged('failed');
        setError(
          `Failed to update campaign to pending approval: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        );
      }
    },
    [updateCampaign, onStateChanged],
  );
  const { createCampaignContract } = useCreateCampaignContract({
    onConfirmed: onUpdateCampaingToPendingApproval,
  });
  const deployCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onStateChanged('setup');
        await createCampaignContract({
          campaignId: campaign.id,
          onStateChanged,
        });
      } catch (error) {
        onStateChanged('failed');
        console.error('Error deploying campaign:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to deploying campaign',
        );
      }
    },
    [createCampaignContract, onStateChanged, setError],
  );

  const onDeploy = useCallback(async () => {
    setIsLoading(true);
    await deployCampaign(campaign);
    setIsLoading(false);
  }, [deployCampaign, campaign]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description: 'Campaign has been deployed successfully',
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

  if (campaign.status !== 'DRAFT') {
    return null;
  }
  return (
    <Button
      onClick={onDeploy}
      className={buttonClassName || 'mt-4 bg-gray-600 hover:bg-gray-700'}
      disabled={isLoading}
      title="Deploy treasury contract for this campaign"
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isLoading ? 'Processing...' : 'Deploy Treasury'}
    </Button>
  );
}
