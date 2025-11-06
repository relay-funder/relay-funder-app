import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { AdminEventFeedExplore } from '@/components/event-feed/admin-event-feed-explore';
import {
  ADMIN_EVENT_FEED_QUERY_KEY,
  fetchAdminEventFeedPage,
} from '@/lib/hooks/useAdminEventFeed';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Event Feed Management | Relay Funder',
};

async function prefetchAdminEventFeed(
  queryClient: ReturnType<typeof getQueryClient>,
) {
  // Prefetch first page so the client list can hydrate instantly
  await queryClient.prefetchInfiniteQuery({
    queryKey: [ADMIN_EVENT_FEED_QUERY_KEY, 'infinite', 10, null],
    initialPageParam: 1,
    queryFn: async () => {
      return fetchAdminEventFeedPage({ pageParam: 1, pageSize: 10 });
    },
  });
}

export default async function EventFeedPage() {
  const session = await auth();
  const isAdmin = session?.user.roles.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const queryClient = getQueryClient();
  await prefetchAdminEventFeed(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminEventFeedExplore />
    </HydrationBoundary>
  );
}
