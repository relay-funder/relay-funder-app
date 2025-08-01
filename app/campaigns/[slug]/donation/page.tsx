import { CampaignDonationForm } from '@/components/campaign/donation/form';
import ProjectInfo from '@/components/project-info';
import { Campaign } from '@/types/campaign';
import { getCampaign } from '@/lib/database';
import { PageHeaderSticky } from '@/components/page/header-sticky';
import { PageMainTwoColumns } from '@/components/page/two-cols';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign: Campaign = await getCampaign(slug);
  return (
    <>
      <PageHeaderSticky message="Donating to" title={campaign.title} />
      <PageMainTwoColumns>
        <CampaignDonationForm campaign={campaign} />
        <ProjectInfo slug={slug} />
      </PageMainTwoColumns>
    </>
  );
}
