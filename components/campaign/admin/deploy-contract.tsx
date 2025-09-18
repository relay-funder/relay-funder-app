'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DbCampaign } from '@/types/campaign';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CAMPAIGNS_QUERY_KEY } from '@/lib/hooks/useCampaigns';

export function CampaignAdminDeployContractButton({
  campaign,
  onUpdate,
}: {
  campaign: DbCampaign;
  onUpdate?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deployContract = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/campaigns/${campaign.id}/deploy-campaign-contract`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Contract deployment failed: ${errorData.error || 'Unknown server error'}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          `Contract deployment failed: ${result.error || 'Unknown error'}`
        );
      }

      toast({
        title: 'Success',
        description: `Campaign contract deployed successfully. Transaction: ${result.txHash}`,
      });

      // Invalidate React Query cache to refresh campaign data
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY, campaign.id] });
      queryClient.invalidateQueries({ queryKey: [CAMPAIGNS_QUERY_KEY, campaign.slug] });

      // Trigger parent component update if callback provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [campaign.id, campaign.slug, onUpdate, toast, queryClient]);

  // Only show button if campaign doesn't have a contract address yet
  if (campaign.campaignAddress) {
    return null;
  }

  // Admin can deploy contracts for any campaign status

  // Check if this is a critical next step
  const isPendingApproval = campaign.status === 'PENDING_APPROVAL';
  const needsContractDeployment = !campaign.campaignAddress && isPendingApproval;

  return (
    <div className="space-y-2">
      <Button
        onClick={deployContract}
        className={needsContractDeployment 
          ? "bg-blue-700 hover:bg-blue-800" 
          : "bg-blue-600 hover:bg-blue-700"
        }
        disabled={isLoading}
        title="Deploy the campaign info factory contract for this campaign on-chain."
      >
        {isLoading ? 'Deploying Contract...' : needsContractDeployment ? 'Deploy Contract (Required)' : 'Deploy Contract'}
      </Button>
      
      {needsContractDeployment && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Required: Deploy campaign contract before approval
        </div>
      )}
      
      {campaign.campaignAddress && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Contract deployed: {campaign.campaignAddress}
        </div>
      )}
      
      {error && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
