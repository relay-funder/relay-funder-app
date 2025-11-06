import { prefetchCampaign } from '@/lib/api/campaigns';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Metadata } from 'next';
import { getQueryClient } from '@/lib/query-client';
import { CampaignEditPage } from '@/components/campaign/edit/page';
import { Web3ContextProvider } from '@/lib/web3';

export const metadata: Metadata = {
  title: 'Edit Campaign | Relay Funder',
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
    <Web3ContextProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CampaignEditPage slug={slug} />
      </HydrationBoundary>
    </Web3ContextProvider>
  );
}
