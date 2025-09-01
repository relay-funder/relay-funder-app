import { useCallback } from 'react';
import { CreateProcessStates } from '@/types/campaign';
import { useCreateCampaign, useUpdateCampaign } from '@/lib/hooks/useCampaigns';
import {
  IOnCreateCampaignConfirmed,
  useCreateCampaignContract,
} from '@/lib/web3/hooks/useCreateCampaignContract';
import { useAuth } from '@/contexts';
import { CampaignFormSchemaType } from './form';

export function useCampaignFormCreate({
  onStateChanged,
  onCreated,
  onError,
}: {
  onCreated?: () => void;
  onStateChanged: (arg0: keyof typeof CreateProcessStates) => void;
  onError: (arg0: string) => void;
}) {
  const { authenticated } = useAuth();

  const { mutateAsync: createCampaign } = useCreateCampaign();
  const { mutateAsync: updateCampaign } = useUpdateCampaign();

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
          await updateCampaign({
            campaignId,
            transactionHash: hash,
            status: 'pending_approval',
            campaignAddress,
          });
          if (typeof onCreated === 'function') {
            onCreated();
          }
          onStateChanged('done');
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
          await updateCampaign({
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
    [updateCampaign, onCreated, onStateChanged, onError],
  );
  const { createCampaignContract } = useCreateCampaignContract({ onConfirmed });
  const mutateAsync = useCallback(
    async (data: CampaignFormSchemaType) => {
      try {
        onStateChanged('setup');
        if (!authenticated) {
          throw new Error('Wallet not connected or contract not available');
        }
        onStateChanged('create');
        if (data.title.startsWith('QA:throw:createCampaign')) {
          throw new Error('Create campaign contract failure');
        }
        const newCampaign = await createCampaign(data);
        if (data.title.startsWith('QA:throw:createCampaignContract')) {
          throw new Error('Create campaign contract failure');
        }
        await createCampaignContract({
          startTime: data.startTime,
          endTime: data.endTime,
          fundingGoal: data.fundingGoal,
          onStateChanged: onStateChanged,
          campaignId: newCampaign.campaignId,
        });
      } catch (error) {
        onStateChanged('failed');
        onError(
          `Failed to create campaign: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        );
      }
    },
    [
      authenticated,
      createCampaign,
      createCampaignContract,
      onError,
      onStateChanged,
    ],
  );
  return { mutateAsync };
}
