import { prefetchRound } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundDetailEnhanced } from '@/components/round/detail-enhanced';
import { auth } from '@/server/auth';

export default async function RoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const session = await auth();
  const sessionAddress = session?.user.address ?? null;
  const isAdmin = session?.user.roles.includes('admin') ?? false;
  const id = parseInt(paramId);
  const queryClient = getQueryClient();
  await prefetchRound(queryClient, id, isAdmin, sessionAddress);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundDetailEnhanced id={id} />
    </HydrationBoundary>
  );
}
