import { useFormContext } from 'react-hook-form';

import { useMemo } from 'react';
import { DbCampaign } from '@/types/campaign';
import { useSession } from 'next-auth/react';
import { CampaignCard } from '../campaign-card';
import { CampaignFormSchema } from './form';
import {
  transformStartTime,
  transformEndTime,
} from '@/lib/utils/campaign-status';
export function CampaignCreateFormSummary() {
  const form = useFormContext();
  const session = useSession();

  const campaign = useMemo(() => {
    try {
      // Parse form data for validation and data transformation (date formatting, etc.)
      const values = CampaignFormSchema.parse(form.getValues());

      // Include uploaded image in preview when available, keep empty for dev prefill
      const media = values.bannerImage
        ? [
            {
              id: 'preview-image',
              url: values.bannerImage,
              mimeType: values.bannerImage.type,
              caption: null,
              createdAt: new Date(),
              state: 'CREATED' as const,
            },
          ]
        : [];

      const mediaOrder = values.bannerImage ? ['preview-image'] : [];

      return {
        id: 0,
        title: values.title,
        description: values.description,
        fundingGoal: values.fundingGoal,
        fundingUsage: values.fundingUsage,
        startTime: new Date(transformStartTime(values.startTime)),
        endTime: new Date(transformEndTime(values.endTime)),
        creatorAddress: session?.data?.user.address,
        status: 'DRAFT',
        transactionHash: null,
        campaignAddress: null,
        treasuryAddress: null,
        category: values.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        media,
        mediaOrder,
        slug: 'summary-campaign',
        location: values.location,
        creator: { ...(session?.data?.user ?? {}) },
      } as DbCampaign;
    } catch (error) {
      console.warn(
        'Error parsing form data in summary, using fallback:',
        error,
      );
      // Return a minimal fallback campaign object to prevent crashes
      return {
        id: 0,
        title: 'Campaign Preview',
        description: 'Please complete the campaign form to see a full preview.',
        fundingGoal: '1000',
        fundingRaised: '0',
        fundingUsage:
          'This is an example funding usage. Please update this with your own funding usage.',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        creatorAddress: session?.data?.user.address || '',
        status: 'DRAFT',
        transactionHash: null,
        campaignAddress: null,
        treasuryAddress: null,
        category: 'education',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: [],
        mediaOrder: [],
        slug: 'summary-campaign-error',
        location: 'Unknown',
        creator: { ...(session?.data?.user ?? {}) },
      } as DbCampaign;
    }
  }, [form, session?.data?.user]);
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
          Campaign Preview
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          This is how your campaign will appear to potential supporters.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <CampaignCard
            campaign={campaign}
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
