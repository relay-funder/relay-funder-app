'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { CampaignMainImage } from '@/components/campaign/main-image';
import { CampaignCardFull } from '@/components/campaign/card-full';
import { CampaignDetailTabs } from '@/components/campaign/detail-tabs';
import { PageHome } from '@/components/page/home';
import { UserInlineName } from '@/components/user/inline-name';
import { CampaignLocation } from '@/components/campaign/location';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from './loading';

export function CampaignFull({ slug }: { slug: string }) {
  const { data: campaignInstance, isPending } = useCampaign(slug);
  if (isPending) {
    return <CampaignLoading />;
  }
  const campaign = campaignInstance?.campaign;
  if (!campaign) {
    notFound();
  }

  const header = (
    <PageHeader featured={true} tags={['Technology']} title={campaign.title}>
      <div className="mb-2 flex items-center justify-between gap-1">
        <UserInlineName user={campaign.creator} />
        <CampaignLocation campaign={campaign} />
      </div>
    </PageHeader>
  );
  return (
    <PageHome header={header}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <CampaignMainImage campaign={campaign} />
        <div className="lg:col-span-4">
          <CampaignCardFull campaign={campaign} />
        </div>
        <div className="lg:col-span-8">
          <CampaignDetailTabs campaign={campaign} />
        </div>
      </div>
    </PageHome>
  );
}
