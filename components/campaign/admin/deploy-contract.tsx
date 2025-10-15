'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DbCampaign } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';
import { useAdminUpdateCampaignTransaction } from '@/lib/hooks/useCampaigns';
import { useAdminDeployCampaignContract } from '@/lib/web3/hooks/useAdminDeployCampaignContract';
import { cn } from '@/lib/utils';
import { Rocket } from 'lucide-react';

export function CampaignAdminDeployContractButton({
  campaign,
  onUpdate,
  buttonClassName,
}: {
  campaign: DbCampaign;
  onUpdate?: () => void;
  buttonClassName?: string;
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const { deployCampaignContract } = useAdminDeployCampaignContract();
  const { mutateAsync: updateTransaction } =
    useAdminUpdateCampaignTransaction();

  const handleDeploy = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsDeploying(true);

    try {
      // Deploy using web3 hook
      const result = await deployCampaignContract(campaign);

      // Update DB
      await updateTransaction({
        campaignId: campaign.id,
        transactionHash: result.txHash,
        campaignAddress: result.campaignAddress,
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
    } finally {
      setIsDeploying(false);
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
    <Button
      onClick={handleDeploy}
      className={
        buttonClassName ||
        cn(
          'w-full',
          needsContractDeployment
            ? 'bg-blue-700 hover:bg-blue-800'
            : 'bg-blue-600 hover:bg-blue-700',
        )
      }
      disabled={isDeploying}
      title="Deploy the campaign info factory contract for this campaign on-chain."
    >
      <Rocket className="mr-2 h-4 w-4" />
      {isDeploying ? 'Deploying...' : 'Deploy Contract'}
    </Button>
  );
}
