import { useCallback } from 'react';
import { UpdateProcessStates, DbCampaign } from '@/types/campaign';
import { useUpdateCampaignData } from '@/lib/hooks/useCampaigns';
import { useAuth } from '@/contexts';
import { CampaignFormSchemaType } from './form';
import {
  useCreateCampaignContract,
  IOnCreateCampaignConfirmed,
} from '@/lib/web3/hooks/useCreateCampaignContract';

export function useCampaignFormEdit({
  onStateChanged,
  campaign,
  onError,
  onSuccess,
}: {
  campaign: DbCampaign;
  onStateChanged: (arg0: keyof typeof UpdateProcessStates) => void;
  onError: (arg0: string) => void;
  onSuccess?: (wasSubmittedForApproval: boolean) => void;
}) {
  const { authenticated } = useAuth();

  const { mutateAsync: updateCampaignData } = useUpdateCampaignData({
    campaign,
  });

  const updateCampaignStatus = useCallback(
    async (data: {
      campaignId: number;
      status?: string;
      transactionHash?: string;
      campaignAddress?: string;
    }) => {
      const response = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to update campaign status';
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error
            ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
            : errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      return response.json();
    },
    [],
  );

  const onConfirmed = useCallback(
    async ({
      hash,
      status,
      campaignAddress,
      campaignId,
    }: IOnCreateCampaignConfirmed) => {
      try {
        if (status === 'success') {
          onStateChanged('updateDbCampaign');
          await updateCampaignStatus({
            campaignId,
            transactionHash: hash,
            status: 'pending_approval',
            campaignAddress,
          });
          if (onSuccess) {
            onSuccess(true); // Was submitted for approval
          } else {
            onStateChanged('done');
          }
        } else {
          onStateChanged('failed');
          onError(
            `Transaction failed, received ${status} status. Campaign remains in draft state. Please try again.`,
          );
        }
      } catch (error) {
        console.error('Error processing transaction:', error);
        onStateChanged('failed');
        try {
          await updateCampaignStatus({
            campaignId,
            status: 'failed',
            transactionHash: hash,
          });
        } catch {
          // pass
        }
        onError(
          `Transaction Failed ${
            error instanceof Error
              ? error.message
              : 'Campaign remains in draft state. Please try again.'
          }`,
        );
      }
    },
    [updateCampaignStatus, onSuccess, onStateChanged, onError],
  );

  const { createCampaignContract } = useCreateCampaignContract({ onConfirmed });

  const mutateAsync = useCallback(
    async (data: CampaignFormSchemaType & { _submitForApproval?: boolean }) => {
      try {
        onStateChanged('setup');
        if (!authenticated) {
          throw new Error('Wallet not connected or contract not available');
        }

        if (data.title.startsWith('QA:throw:updateCampaignContract')) {
          throw new Error('Update campaign contract failure');
        }

        const { _submitForApproval, ...campaignData } = data;

        if (_submitForApproval) {
          // If submitting for approval, first update DB then deploy contract
          onStateChanged('create');
          await updateCampaignData({
            campaignId: campaign.id,
            ...campaignData,
            // Don't change status yet for approval submissions - will be set after contract deployment
          });

          // Deploy the smart contract
          if (data.title.startsWith('QA:throw:createCampaignContract')) {
            throw new Error('Create campaign contract failure');
          }

          // Start contract deployment process - this will call onConfirmed when done
          await createCampaignContract({
            onStateChanged: onStateChanged,
            campaignId: campaign.id,
          });
        } else {
          // For draft saves or regular saves, update DB and call success callback directly
          // Skip progress display for simple saves
          await updateCampaignData({
            campaignId: campaign.id,
            ...campaignData,
          });

          if (onSuccess) {
            onSuccess(false); // Was not submitted for approval
          } else {
            onStateChanged('done');
          }
        }
      } catch (error) {
        onStateChanged('failed');
        onError(
          `Failed to update campaign: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        );
      }
    },
    [
      authenticated,
      updateCampaignData,
      createCampaignContract,
      onError,
      onStateChanged,
      onSuccess,
      campaign.id,
    ],
  );
  return { mutateAsync };
}
