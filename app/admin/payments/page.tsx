import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { ADMIN_PAYMENTS_QUERY_KEY } from '@/lib/hooks/useAdminPayments';
import { listAdminPayments } from '@/lib/api/adminPayments';
import { PaymentsExplore } from '@/components/admin/payments/explore';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Payment Management | Relay Funder',
};

async function prefetchAdminPayments(
  queryClient: ReturnType<typeof getQueryClient>,
) {
  // Prefetch first page so the client list can hydrate instantly
  // useInfiniteAdminPayments queryKey shape:
  // [ADMIN_PAYMENTS_QUERY_KEY, 'infinite', pageSize, filters]
  const pageSize = 10;
  const filters = {};
  await queryClient.prefetchInfiniteQuery({
    queryKey: [ADMIN_PAYMENTS_QUERY_KEY, 'infinite', pageSize, filters],
    initialPageParam: 1,
    queryFn: async () => {
      return listAdminPayments({ page: 1, pageSize });
    },
  });
}

export default async function PaymentsPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const queryClient = getQueryClient();
  await prefetchAdminPayments(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentsExplore />
    </HydrationBoundary>
  );
}
