import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { ExploreStories } from '@/components/explore-stories';
import { prefetchCampaigns } from '@/lib/api/campaigns';
import { prefetchActiveCategories } from '@/lib/api/categories';
import { getQueryClient } from '@/lib/query-client';
import { Suspense } from 'react';

export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch both campaigns and categories in parallel for instant loading
  await Promise.all([
    prefetchCampaigns(queryClient),
    prefetchActiveCategories(queryClient),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <ExploreStories />
      </Suspense>
    </HydrationBoundary>
  );
}
