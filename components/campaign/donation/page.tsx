'use client';
import { notFound } from 'next/navigation';
import { PageHome } from '@/components/page/home';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from '@/components/campaign/loading';
import { useAuth } from '@/contexts';
import { CampaignError } from '@/components/campaign/error';
import { PageHeaderSticky } from '@/components/page/header-sticky';
import { DetailContainer } from '@/components/layout';
import { CampaignDonationForm } from './form';
import ProjectInfo from '@/components/project-info';

export function CampaignDonationPage({ slug }: { slug: string }) {
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

  return (
    <>
      <PageHeaderSticky message="Campaign" title="" />
      <main className="w-full">
        <DetailContainer variant="standard" padding="md">
          <div className="grid gap-8 lg:grid-cols-2">
            <CampaignDonationForm campaign={campaign} />
            <ProjectInfo campaign={campaign} />
          </div>
        </DetailContainer>
      </main>
    </>
  );
}
