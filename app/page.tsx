import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { ExploreStories } from '@/components/explore-stories';
import { prefetchCampaigns } from '@/lib/api/campaigns';
import { getQueryClient } from '@/lib/query-client';

export default function HomePage() {
  const queryClient = getQueryClient();
  prefetchCampaigns(queryClient);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExploreStories />
    </HydrationBoundary>
  );
}
