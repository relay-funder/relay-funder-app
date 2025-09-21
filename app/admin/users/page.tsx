import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { UserExplore } from '@/components/admin/user/explore';
import { ADMIN_USERS_QUERY_KEY } from '@/lib/hooks/useAdminUsers';
import { listUsers } from '@/lib/api/user';

async function prefetchAdminUsers(
  queryClient: ReturnType<typeof getQueryClient>,
) {
  // Prefetch first page so the client list can hydrate instantly
  await queryClient.prefetchInfiniteQuery({
    queryKey: [ADMIN_USERS_QUERY_KEY, 'infinite', 10, ''],
    initialPageParam: 1,
    queryFn: async () => {
      return listUsers({ page: 1, pageSize: 10 });
    },
  });
}

export default async function UsersPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const queryClient = getQueryClient();
  await prefetchAdminUsers(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserExplore />
    </HydrationBoundary>
  );
}
