import { prefetchRounds } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundExplore } from '@/components/round/explore';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Round Management | Relay Funder',
};

export default async function RoundsPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }
  const queryClient = getQueryClient();
  await prefetchRounds(queryClient, isAdmin);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoundExplore />
    </HydrationBoundary>
  );
}
