'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { CampaignMainImage } from '@/components/campaign/main-image';
import { CampaignCardFull } from '@/components/campaign/card-full';
import { CampaignDetailTabs } from '@/components/campaign/detail-tabs';
import { PageHome } from '@/components/page/home';
import { DetailContainer } from '@/components/layout';
import { UserInlineName } from '@/components/user/inline-name';
import { CampaignLocation } from '@/components/campaign/location';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from './loading';
import { useAuth } from '@/contexts';
import { CampaignStatus } from './status';
import { CampaignError } from './error';
import { useCampaignCategory } from '@/hooks/use-campaign-category';
import { isCampaignFeatured } from '@/lib/utils/campaign-status';

export function CampaignFull({ slug }: { slug: string }) {
  const { address, isAdmin, isReady } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  const { details } = useCampaignCategory({
    campaign: campaignInstance?.campaign,
  });
  if (isPending || !isReady) {
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

  // Navigation header without title
  const navHeader = (
    <PageHeader
      featured={isCampaignFeatured(campaign)}
      tags={[details?.name ?? 'Technology']}
    />
  );

  return (
    <PageHome header={navHeader}>
      <DetailContainer variant="standard" padding="md">
        {/* Title and metadata section within constraints */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            {campaign.title}
          </h1>
          <div className="flex items-center justify-between gap-1">
            <UserInlineName user={campaign.creator} badges={true} />
            <CampaignLocation campaign={campaign} />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="relative flex flex-col p-0 lg:col-span-8">
            <CampaignMainImage campaign={campaign} />
            <div className="absolute pl-1 pt-1">
              <CampaignStatus campaign={campaign} />
            </div>
          </div>
          <div className="lg:col-span-4">
            <CampaignCardFull campaign={campaign} />
          </div>
          <div className="lg:col-span-8">
            <CampaignDetailTabs campaign={campaign} />
          </div>
        </div>
      </DetailContainer>
    </PageHome>
  );
}
