import { useFormContext } from 'react-hook-form';

import { useMemo } from 'react';
import { DbCampaign } from '@/types/campaign';
import { useSession } from 'next-auth/react';
import { CampaignCardDashboard } from '../card-dashboard';
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

        creator: { ...(session?.data?.user ?? {}), isKycCompleted: false },
      } as DbCampaign;
    } catch {
      return undefined;
    }
  }, [form, session?.data?.user]);
  return (
    <div className="pb-2">
      <h2 className={cn('flex justify-self-center text-lg')}>Preview</h2>
      <div className="flex max-w-[400px] justify-self-center">
        <CampaignCardDashboard campaign={campaign} />
      </div>
    </div>
  );
}
