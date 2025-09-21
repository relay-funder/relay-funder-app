import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import AdminUserDetailContent from '@/components/admin/user/detail/page-content';
import { auth } from '@/server/auth';
import { getQueryClient } from '@/lib/query-client';
import { prefetchAdminUserOverview } from '@/lib/hooks/useAdminUserOverview';

type PageParams =
  | { params: Promise<{ id: string }> }
  | { params: { id: string } };

export default async function AdminUserDetailPage(props: PageParams) {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  // Handle potential Promise in params for compatibility with various Next setups
  const awaitedParams =
    'params' in props && 'then' in (props.params as Promise<unknown>)
      ? await (props.params as Promise<{ id: string }>)
      : ((props as { params: { id: string } }).params as { id: string });

  const address = decodeURIComponent(awaitedParams.id);

  const queryClient = getQueryClient();
  let ok = true;
  try {
    await prefetchAdminUserOverview(queryClient, address);
  } catch {
    ok = false;
  }

  if (!ok) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          User not found
        </div>
      </div>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUserDetailContent address={address} />
    </HydrationBoundary>
  );
}
