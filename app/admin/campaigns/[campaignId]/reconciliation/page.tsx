import { AdminAccessDenied } from '@/components/admin/access-denied';
import { auth } from '@/server/auth';
import { CampaignReconciliationView } from '@/components/admin/campaigns/reconciliation/view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Reconciliation | Relay Funder',
};

export default async function CampaignReconciliationPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const session = await auth();
  const isAdmin = session?.user?.roles?.includes('admin');
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const { campaignId } = params;

  // Note: Detail pages typically don't prefetch complex data since
  // the client hooks handle data fetching efficiently and the user
  // is intentionally navigating to this specific page

  return <CampaignReconciliationView campaignId={campaignId} />;
}
