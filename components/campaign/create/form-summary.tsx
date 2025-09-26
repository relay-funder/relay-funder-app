import { useFormContext } from 'react-hook-form';

import { useMemo } from 'react';
import { DbCampaign } from '@/types/campaign';
import { useSession } from 'next-auth/react';
import { CampaignCard } from '../campaign-card';
import { CampaignFormSchema } from './form';
import { cn } from '@/lib/utils';
export function CampaignCreateFormSummary() {
  const form = useFormContext();
  const session = useSession();
  const campaign = useMemo(() => {
    try {
      const rawValues = form.getValues();
      const values = CampaignFormSchema.parse(rawValues);
      return {
        id: 0,
        title: values.title,
        description: values.description,
        fundingGoal: values.fundingGoal,
        startTime: new Date(values.startTime),
        endTime: new Date(values.endTime),
        creatorAddress: session?.data?.user.address,
        status: 'DRAFT',
        transactionHash: null,
        campaignAddress: null,
        treasuryAddress: null,
        category: values.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        media: [
          {
            id: 'unsaved',
            url: values.bannerImage,
            mimeType: 'image/unknown',
          },
        ],
        mediaOrder: ['unsaved'],
        slug: 'summary-campaign',
        location: values.location,

        creator: { ...(session?.data?.user ?? {}) },
      } as DbCampaign;
    } catch {
      return undefined;
    }
  }, [form, session?.data?.user]);
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Campaign Preview
        </h3>
        <p className="mb-6 text-sm text-gray-600">
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
