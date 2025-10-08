'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { useAdminApproveCampaign as useAdminApproveWeb3Campaign } from '@/lib/web3/hooks/useAdminApproveCampaign';
import { useAdminApproveCampaign } from '@/lib/hooks/useCampaigns';
import { AdminApproveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { CheckCircle } from 'lucide-react';
import { FormattedDate } from '@/components/formatted-date';
import {
  getValidationSummary,
  ValidationStage,
} from '@/lib/ccp-validation/campaign-validation';

export function CampaignAdminApproveButton({
  campaign,
  buttonClassName,
}: {
  campaign: DbCampaign;
  buttonClassName?: string;
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
        // Validate campaign can proceed to ACTIVE state
        const validation = getValidationSummary(
          campaign,
          ValidationStage.ACTIVE,
        );
        if (!validation.canProceed) {
          throw new Error(
            `Campaign validation failed: ${validation.messages[0]}`,
          );
        }

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

  // Check if campaign has already started (would cause treasury config failure)
  const campaignStartTime = new Date(campaign.startTime).getTime();
  const now = Date.now();
  const hasStarted = campaignStartTime <= now;

  // Show dependency requirements
  const canApprove =
    campaign.campaignAddress !== null &&
    campaign.campaignAddress !== undefined &&
    !hasStarted; // Cannot approve campaigns that have already started

  return (
    <div className="space-y-2">
      {hasStarted && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <p className="font-medium text-red-700 dark:text-red-300">
              Campaign Cannot Be Approved
            </p>
          </div>
          <p className="mt-2 text-red-600 dark:text-red-400">
            This campaign has already started (
            <FormattedDate date={new Date(campaign.startTime)}/>). Treasury
            configuration would fail because the start time is in the past.
          </p>
        </div>
      )}
      <Button
        onClick={onApprove}
        className={
          buttonClassName || 'mt-4 w-full bg-green-600 hover:bg-green-700'
        }
        disabled={isLoading || !canApprove}
        title={
          hasStarted
            ? 'Cannot approve campaigns that have already started. Treasury configuration would fail.'
            : !canApprove && campaign.campaignAddress
              ? "Campaign contract must be deployed before approval. Use 'Deploy Contract' first."
              : 'Mark this Campaign as approved and deploy treasury contract.'
        }
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        {isLoading ? 'Processing...' : 'Approve'}
      </Button>
    </div>
  );
}
