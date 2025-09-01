import { prefetchCampaign } from '@/lib/api/campaigns';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { CampaignDonationPage } from '@/components/campaign/donation/page';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  await prefetchCampaign(queryClient, slug);
  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CampaignDonationPage slug={slug} />
      </HydrationBoundary>
    </>
  );
}
