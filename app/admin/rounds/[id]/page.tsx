import { prefetchRound } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundFull } from '@/components/round/full';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Round Details | Relay Funder',
};

export default async function RoundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }
  const { id: paramsId } = await params;
  const id = parseInt(paramsId);
  const queryClient = getQueryClient();
  await prefetchRound(queryClient, id, isAdmin);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundFull id={id} />
    </HydrationBoundary>
  );
}
