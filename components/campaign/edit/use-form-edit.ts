import { useCallback } from 'react';
import { UpdateProcessStates, DbCampaign } from '@/types/campaign';
import { useUpdateCampaignData } from '@/lib/hooks/useCampaigns';
import { useAuth } from '@/contexts';
import { CampaignFormSchemaType } from './form';

export function useCampaignFormEdit({
  onStateChanged,
  campaign,
  onError,
}: {
  campaign: DbCampaign;
  onStateChanged: (arg0: keyof typeof UpdateProcessStates) => void;
  onError: (arg0: string) => void;
}) {
  const { authenticated } = useAuth();

  const { mutateAsync: updateCampaignData } = useUpdateCampaignData({
    campaign,
  });

  const mutateAsync = useCallback(
    async (data: CampaignFormSchemaType) => {
      try {
        onStateChanged('setup');
        if (!authenticated) {
          throw new Error('Wallet not connected or contract not available');
        }
        onStateChanged('updateDbCampaign');
        if (data.title.startsWith('QA:throw:updateCampaignContract')) {
          throw new Error('Update campaign contract failure');
        }
        await updateCampaignData({
          campaignId: campaign.id,
          ...data,
        });
        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        onError(
          `Failed to update campaign: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        );
      }
    },
    [authenticated, updateCampaignData, onError, onStateChanged, campaign.id],
  );
  return { mutateAsync };
}
