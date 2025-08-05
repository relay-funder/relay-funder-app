import { prefetchCampaign } from '@/lib/api/campaigns';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { CampaignFull } from '@/components/campaign/full';

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const queryClient = getQueryClient();
  await prefetchCampaign(queryClient, slug);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CampaignFull slug={slug} />
    </HydrationBoundary>
  );
}
