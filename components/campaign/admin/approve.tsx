'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminApproveCampaign as useAdminApproveWeb3Campaign } from '@/lib/web3/hooks/useAdminApproveCampaign';
import { useAdminApproveCampaign } from '@/lib/hooks/useCampaigns';
import { AdminApproveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';

export function CampaignAdminApproveButton({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminApproveProcessStates>('idle');

  const { toast } = useToast();
  const { mutateAsync: adminApproveCampaign } = useAdminApproveCampaign();
  const { adminApproveCampaign: adminApproveWeb3Campaign } =
    useAdminApproveWeb3Campaign();

  const onStateChanged = useCallback(
    (state: keyof typeof AdminApproveProcessStates) => {
      setProcessState(state);
    },
    [],
  );

  const approveCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        if (campaign.treasuryAddress) {
          await adminApproveCampaign({
            campaignId: campaign.id,
            treasuryAddress: campaign.treasuryAddress,
          });
        } else {
          if (!campaign.campaignAddress) {
            throw new Error('Invalid campaign, missing campaignAddress');
          }
          const treasuryAddress = await adminApproveWeb3Campaign(
            campaign.id,
            campaign.campaignAddress,
            onStateChanged,
          );
          await adminApproveCampaign({
            campaignId: campaign.id,
            treasuryAddress,
          });
        }
        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        console.error('Error approving campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to approve campaign',
        );
      }
    },
    [adminApproveCampaign, adminApproveWeb3Campaign, onStateChanged],
  );
  const onApprove = useCallback(async () => {
    setIsLoading(true);
    await approveCampaign(campaign);
    setIsLoading(false);
  }, [approveCampaign, campaign]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description: 'Campaign has been approved successfully',
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

  if (campaign.status !== 'PENDING_APPROVAL') {
    return null;
  }

  // Show dependency requirements
  const canApprove =
    campaign.campaignAddress !== null && campaign.campaignAddress !== undefined;

  return (
    <div className="space-y-2">
      <Button
        onClick={onApprove}
        className="mt-4 bg-green-600 hover:bg-green-700"
        disabled={isLoading || !canApprove}
        title={
          !canApprove
            ? "Campaign contract must be deployed before approval. Use 'Deploy Contract' first."
            : 'Mark this Campaign as approved and deploy treasury contract.'
        }
      >
        {isLoading ? 'Processing...' : 'Approve & Deploy Treasury'}
      </Button>

      {!canApprove && (
        <div className="rounded bg-gray-50 p-2 text-sm text-gray-600">
          Campaign contract must be deployed first
        </div>
      )}
    </div>
  );
}
