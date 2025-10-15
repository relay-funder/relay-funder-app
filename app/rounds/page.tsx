import { prefetchRounds } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundExplore } from '@/components/round/explore';

export default async function RoundsPage() {
  const queryClient = getQueryClient();
  // Force user-only view even for admins - this is the public user-facing rounds page
  await prefetchRounds(queryClient, false);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundExplore forceUserView={true} />
    </HydrationBoundary>
  );
}
