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
import { useAuth } from '@/contexts';
import { CampaignDashboardStatus } from './dashboard-status';
import { CampaignError } from './error';

export function CampaignFull({ slug }: { slug: string }) {
  const { address, isAdmin } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  if (isPending) {
    return <CampaignLoading />;
  }
  const campaign = campaignInstance?.campaign;
  if (!campaign) {
    notFound();
  }
  if (
    campaign.status !== 'ACTIVE' &&
    address !== campaign.creatorAddress &&
    !isAdmin
  ) {
    // admins and campaign owners can see inactive campaigns, everyone else
    // will get an error
    return (
      <PageHome header="">
        <CampaignError error="Not Active" />
      </PageHome>
    );
  }

  const header = (
    <PageHeader
      featured={true}
      tags={[campaign.category ?? 'Technology']}
      title={campaign.title}
    >
      <div className="mb-2 flex items-center justify-between gap-1">
        <UserInlineName user={campaign.creator} badges={true} />
        <CampaignLocation campaign={campaign} />
      </div>
    </PageHeader>
  );
  return (
    <PageHome header={header}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="relative flex flex-col p-0 lg:col-span-8">
          <CampaignMainImage campaign={campaign} />
          <div className="absolute pl-1 pt-1">
            <CampaignDashboardStatus campaign={campaign} />
          </div>
        </div>
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
