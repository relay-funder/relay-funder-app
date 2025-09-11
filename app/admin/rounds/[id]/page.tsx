import { prefetchCampaign } from '@/lib/api/campaigns';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundFull } from '@/components/round/full';

export default async function RoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();
  await prefetchCampaign(queryClient, id);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundFull id={parseInt(id)} />
    </HydrationBoundary>
  );
}
