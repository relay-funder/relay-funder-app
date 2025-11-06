import { prefetchCampaign } from '@/lib/api/campaigns';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Metadata } from 'next';
import { getQueryClient } from '@/lib/query-client';
import { CampaignDonationSuccessPage } from '@/components/campaign/donation/page-success';

export const metadata: Metadata = {
  title: 'Donation Success | Relay Funder',
};

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
        <CampaignDonationSuccessPage slug={slug} />
      </HydrationBoundary>
    </>
  );
}
