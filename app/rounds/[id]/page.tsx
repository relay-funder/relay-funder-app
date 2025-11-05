import { prefetchRound } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Metadata } from 'next';
import { getQueryClient } from '@/lib/query-client';
import { RoundFull } from '@/components/round/full';
import { auth } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Round | Relay Funder',
};

export default async function RoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const session = await auth();
  const sessionAddress = session?.user.address ?? null;
  const id = parseInt(paramId);
  const queryClient = getQueryClient();
  // Force user-only view even for admins - this is the public user-facing round page
  await prefetchRound(queryClient, id, false, sessionAddress);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundFull id={id} forceUserView={true} />
    </HydrationBoundary>
  );
}
