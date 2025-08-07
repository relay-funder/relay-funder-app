import { useFormContext } from 'react-hook-form';

import { useMemo } from 'react';
import { DbCampaign } from '@/types/campaign';
import { useSession } from 'next-auth/react';
import { CampaignCardDashboard } from '../card-dashboard';
import { CampaignFormSchema } from './form';

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
        images: [
          {
            id: 0,
            imageUrl: values.bannerImage,
            isMainImage: true,
            campaignId: 0,
          },
        ],
        slug: 'summary-campaign',
        location: values.location,

        creator: { ...(session?.data?.user ?? {}), isKycCompleted: false },
      } as DbCampaign;
    } catch {
      return undefined;
    }
  }, [form, session?.data?.user]);
  return (
    <div>
      <CampaignCardDashboard campaign={campaign} />
    </div>
  );
}
