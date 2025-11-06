import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { ADMIN_WITHDRAWALS_QUERY_KEY } from '@/lib/hooks/useAdminWithdrawals';
import { listWithdrawals } from '@/lib/api/withdrawals';
// Once implemented, this component should render the withdrawals list UI using
// useInfiniteAdminWithdrawals and provide one-click actions to approve/update.
// Create at: components/admin/withdrawals/explore.tsx
import { WithdrawalsExplore } from '@/components/admin/withdrawals/explore';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Withdrawal Management | Relay Funder',
};

async function prefetchAdminWithdrawals(
  queryClient: ReturnType<typeof getQueryClient>,
) {
  // Prefetch first page so the client list can hydrate instantly
  // useInfiniteAdminWithdrawals queryKey shape:
  // [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite', pageSize, filters]
  const pageSize = 10;
  const filters = { status: 'PENDING' };
  await queryClient.prefetchInfiniteQuery({
    queryKey: [ADMIN_WITHDRAWALS_QUERY_KEY, 'infinite', pageSize, filters],
    initialPageParam: 1,
    queryFn: async () => {
      return listWithdrawals({ page: 1, pageSize, status: 'PENDING' });
    },
  });
}

export default async function WithdrawalsPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const queryClient = getQueryClient();
  await prefetchAdminWithdrawals(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WithdrawalsExplore />
    </HydrationBoundary>
  );
}
