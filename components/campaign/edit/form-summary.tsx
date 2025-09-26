import { useFormContext } from 'react-hook-form';

import { useMemo } from 'react';
import { DbCampaign } from '@/types/campaign';
import { CampaignCard } from '../campaign-card';
import { CampaignFormSchema } from './form';
import { cn } from '@/lib/utils';
export function CampaignEditFormSummary({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const form = useFormContext();
  const updatedCampaign = useMemo(() => {
    try {
      const rawValues = form.getValues();
      const values = CampaignFormSchema.parse(rawValues);

      // Create updated media array - use new image if uploaded, otherwise keep existing
      let updatedMedia = campaign.media || [];
      if (values.bannerImage instanceof File) {
        // New image uploaded - replace the first media item or add new one
        const newMediaItem = {
          id: 'updated',
          url: values.bannerImage,
          mimeType: 'image/unknown',
        };
        updatedMedia = [newMediaItem, ...(updatedMedia.slice(1) || [])];
      }

      // Merge form values with existing campaign data to preserve all fields
      return {
        ...campaign, // Preserve all existing campaign data
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        media: updatedMedia,
        mediaOrder:
          updatedMedia.length > 0
            ? updatedMedia.map((m) => m.id)
            : campaign.mediaOrder,
        updatedAt: new Date(),
      } as DbCampaign;
    } catch {
      return campaign; // Return original campaign if form parsing fails
    }
  }, [form, campaign]);
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Campaign Preview
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          This is how your updated campaign will appear to supporters.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <CampaignCard
            campaign={updatedCampaign}
            type="dashboard"
            disabled={true}
            displayOptions={{
              showEditButton: false,
              showRemoveButton: false,
              showFavoriteButton: false,
              showWithdrawalButton: false,
              showDonateButton: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
