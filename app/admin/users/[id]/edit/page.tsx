import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { getUser } from '@/lib/api/user';
import { ADMIN_USER_QUERY_KEY } from '@/lib/hooks/useAdminUsers';
import AdminUserEditForm from '@/components/admin/user/edit-form';

async function prefetchAdminUser(
  queryClient: ReturnType<typeof getQueryClient>,
  address: string,
) {
  await queryClient.prefetchQuery({
    queryKey: [ADMIN_USER_QUERY_KEY, address],
    // Matches the client hook shape: GetUserResponseInstance
    queryFn: async () => getUser(address),
  });
}

export default async function AdminUserEditPage({
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

  const address = decodeURIComponent(paramsId);

  const queryClient = getQueryClient();
  await prefetchAdminUser(queryClient, address);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto max-w-3xl py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <p className="break-all text-sm text-muted-foreground">
            Address: {address}
          </p>
        </div>

        {/*
          Client edit form should mount below.
          It can use:
            - useAdminUser(address) to read
            - useUpdateAdminUser / useUpdateAdminUserFlags / useUpdateAdminUserRoles to mutate
          This page prefetches the user and guards access.
        */}
        <AdminUserEditForm address={address} />
      </div>
    </HydrationBoundary>
  );
}
