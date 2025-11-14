import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { listCampaigns } from '@/lib/api/campaigns';
import { CampaignAudit } from '@/components/admin/campaigns/audit';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Financial Audit | Relay Funder',
};

async function prefetchAdminCampaigns(
  queryClient: ReturnType<typeof getQueryClient>,
) {
  // Prefetch first page so the client list can hydrate instantly
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['campaigns', 'infinite', 'all', 10],
    initialPageParam: 1,
    queryFn: async () => {
      return listCampaigns({
        admin: true,
        status: 'all',
        page: 1,
        pageSize: 10,
      });
    },
  });
}

export default async function AdminCampaignsPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const queryClient = getQueryClient();
  await prefetchAdminCampaigns(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CampaignAudit />
    </HydrationBoundary>
  );
}
