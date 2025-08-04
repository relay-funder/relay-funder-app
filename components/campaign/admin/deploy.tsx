'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import { AdminDeployProcessStates } from '@/types/admin';
import {
  useCreateCampaignContract,
  IOnCreateCampaignConfirmed,
} from '@/lib/web3/hooks/useCreateCampaignContract';
import type { DbCampaign } from '@/types/campaign';

export function CampaignAdminDeployButton({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminDeployProcessStates>('idle');

  const { toast } = useToast();

  const onStateChanged = useCallback(
    (state: keyof typeof AdminDeployProcessStates) => {
      setProcessState(state);
    },
    [],
  );
  const { mutateAsync: updateCampaign } = useUpdateCampaign();

  const onDeployCampaignConfirmed = useCallback(
    async ({ hash, status, campaignAddress }: IOnCreateCampaignConfirmed) => {
      if (status === 'success') {
        // First update the campaign status to pending_approval
        await updateCampaign({
          campaignId: campaign.id,
          transactionHash: hash,
          status: 'pending_approval',
          campaignAddress,
        });
        onStateChanged('done');
      }
    },
    [campaign, updateCampaign, onStateChanged],
  );
  const { createCampaignContract } = useCreateCampaignContract({
    onConfirmed: onDeployCampaignConfirmed,
  });
  const deployCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onStateChanged('setup');
        await createCampaignContract({
          startTime: campaign.startTime as unknown as string,
          endTime: campaign.endTime as unknown as string,
          fundingGoal: campaign.fundingGoal,
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
      className="mt-4 bg-gray-600 hover:bg-gray-700"
      disabled={isLoading}
      title="Deploy this Campaign from the database"
    >
      {isLoading ? 'Processing...' : 'Deploy'}
    </Button>
  );
}
