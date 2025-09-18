'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DbCampaign } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';
import { useAdminDeployContract } from '@/lib/hooks/useCampaigns';
import { cn } from '@/lib/utils';

export function CampaignAdminDeployContractButton({
  campaign,
  onUpdate,
}: {
  campaign: DbCampaign;
  onUpdate?: () => void;
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const deployMutation = useAdminDeployContract();

  const handleDeploy = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await deployMutation.mutateAsync({
        campaignId: campaign.id,
      });

      setSuccessMessage(
        `Campaign contract deployed successfully. Transaction: ${result.txHash}`,
      );

      // Trigger parent component update if callback provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setErrorMessage(message);
    }
  };

  // Handle success toast with useEffect
  useEffect(() => {
    if (successMessage) {
      toast({
        title: 'Success',
        description: successMessage,
      });
      setSuccessMessage(null);
    }
  }, [successMessage, toast]);

  // Handle error toast with useEffect
  useEffect(() => {
    if (errorMessage) {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setErrorMessage(null);
    }
  }, [errorMessage, toast]);

  // Only show button if campaign doesn't have a contract address yet
  if (campaign.campaignAddress) {
    return null;
  }

  // Admin can deploy contracts for any campaign status

  // Check if this is a critical next step
  const isPendingApproval = campaign.status === 'PENDING_APPROVAL';
  const needsContractDeployment =
    !campaign.campaignAddress && isPendingApproval;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDeploy}
        className={cn(
          'w-full',
          needsContractDeployment
            ? 'bg-blue-700 hover:bg-blue-800'
            : 'bg-blue-600 hover:bg-blue-700',
        )}
        disabled={deployMutation.isPending}
        title="Deploy the campaign info factory contract for this campaign on-chain."
      >
        {deployMutation.isPending
          ? 'Deploying Contract...'
          : needsContractDeployment
            ? 'Deploy Contract (Required)'
            : 'Deploy Contract'}
      </Button>

      {needsContractDeployment && (
        <div className="rounded bg-gray-50 p-2 text-sm text-gray-600">
          Required: Deploy campaign contract before approval
        </div>
      )}

      {campaign.campaignAddress && (
        <div className="rounded bg-gray-50 p-2 text-sm text-gray-600">
          Contract deployed: {campaign.campaignAddress}
        </div>
      )}
    </div>
  );
}
