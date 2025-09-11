import { prefetchRounds } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundExplore } from '@/components/round/explore';

export default async function RoundsPage() {
  const queryClient = getQueryClient();
  await prefetchRounds(queryClient);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundExplore />
    </HydrationBoundary>
  );
}
