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
  const newCampaign = useMemo(() => {
    try {
      const rawValues = form.getValues();
      const values = CampaignFormSchema.parse(rawValues);
      return {
        id: campaign.id,
        title: values.title,
        description: values.description,
        fundingGoal: campaign.fundingGoal,
        startTime: new Date(campaign.startTime),
        endTime: new Date(campaign.endTime),
        creatorAddress: campaign.creatorAddress,
        status: campaign.status,
        transactionHash: campaign.transactionHash,
        campaignAddress: campaign.campaignAddress,
        treasuryAddress: campaign.treasuryAddress,
        category: values.category,
        createdAt: campaign.createdAt,
        updatedAt: new Date(),
        media: [
          {
            id: 'unsaved',
            url: values.bannerImage,
            mimeType: 'image/unknown',
          },
        ],
        mediaOrder: ['unsaved'],
        slug: campaign.slug,
        location: values.location,
        paymentSummary: campaign.paymentSummary ?? {},

        creator: campaign.creator,
      } as DbCampaign;
    } catch {
      return undefined;
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
            campaign={newCampaign}
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
