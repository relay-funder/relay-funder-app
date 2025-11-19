'use client';
import { notFound } from 'next/navigation';
import { PageHome } from '@/components/page/home';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from '@/components/campaign/loading';
import { useAuth } from '@/contexts';
import { CampaignStatus } from '@/components/campaign/status';
import { PageHeaderSticky } from '@/components/page/header-sticky';
import { CampaignEdit } from './index';
import { Info } from 'lucide-react';
import { useCampaignStatus } from '@/hooks/use-campaign-status';

export function CampaignEditPage({ slug }: { slug: string }) {
  const { address, isAdmin } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  const campaign = campaignInstance?.campaign;

  // Call hooks unconditionally - always in same order
  const statusLabel = useCampaignStatus(campaign);

  if (isPending) {
    return <CampaignLoading />;
  }

  if (!campaign) {
    notFound();
  }

  const canEditInactive = address === campaign.creatorAddress || isAdmin;
  const isInactive = campaign.status !== 'ACTIVE';

  if (isInactive && !canEditInactive) {
    // Regular users get 404 for non-active campaigns
    notFound();
  }

  // Only show banner for statuses that allow editing
  const shouldShowBanner =
    campaign.status === 'DRAFT' || campaign.status === 'PENDING_APPROVAL';

  // Dynamic banner content based on status
  const getBannerContent = (status: string, statusLabel: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          title: 'Editing Draft Campaign',
          description:
            'This campaign is not yet active. Make your changes and submit for approval when ready.',
        };
      case 'PENDING_APPROVAL':
        return {
          title: 'Editing Campaign Pending Approval',
          description:
            "Your campaign is under review. You can still make changes before it's approved.",
        };
      default:
        return {
          title: `Editing ${statusLabel} Campaign`,
          description: 'This campaign is not currently active.',
        };
    }
  };

  const bannerContent = getBannerContent(campaign.status, statusLabel);

  return (
    <>
      <PageHeaderSticky message="Editing" title={campaign.title} />
      {shouldShowBanner && (
        <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {bannerContent.title}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {bannerContent.description}
                  </p>
                </div>
              </div>
              <CampaignStatus campaign={campaign} />
            </div>
          </div>
        </div>
      )}
      <PageHome header="">
        <CampaignEdit campaign={campaign} />
      </PageHome>
    </>
  );
}
