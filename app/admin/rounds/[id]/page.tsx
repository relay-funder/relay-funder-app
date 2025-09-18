import { prefetchRound } from '@/lib/api/rounds';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { RoundDetailEnhanced } from '@/components/round/detail-enhanced';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';

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
      <RoundDetailEnhanced id={id} />
    </HydrationBoundary>
  );
}
