import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Metadata } from 'next';

import { ExploreStories } from '@/components/explore-stories';
import { prefetchCampaigns } from '@/lib/api/campaigns';
import { prefetchActiveCategories } from '@/lib/api/categories';
import { prefetchActiveRound } from '@/lib/api/rounds';
import { getQueryClient } from '@/lib/query-client';
import {
  getHomePageMetadata,
  OrganizationStructuredData,
} from '@/components/metadata';
import { generateOrganizationStructuredData } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import { auth } from '@/server/auth';

export const metadata: Metadata = getHomePageMetadata();
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const queryClient = getQueryClient();
  const session = await auth();
  const isUserAdmin = session?.user?.roles?.includes('admin') ?? false;

  // Prefetch campaigns, categories, and active round in parallel for instant loading
  await Promise.all([
    prefetchCampaigns(queryClient, {
      admin: isUserAdmin,
      status: 'active',
      pageSize: 10,
      rounds: false,
    }),
    prefetchActiveCategories(queryClient),
    prefetchActiveRound(queryClient),
  ]);

  // Generate organization structured data
  const organizationData = generateOrganizationStructuredData();

  return (
    <>
      <OrganizationStructuredData data={organizationData} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense>
          <ExploreStories />
        </Suspense>
      </HydrationBoundary>
    </>
  );
}
