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

export function CampaignEditPage({ slug }: { slug: string }) {
  const { address, isAdmin } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  if (isPending) {
    return <CampaignLoading />;
  }
  const campaign = campaignInstance?.campaign;
  if (!campaign) {
    notFound();
  }
  const canEditInactive = address === campaign.creatorAddress || isAdmin;
  const isInactive = campaign.status !== 'ACTIVE';

  if (isInactive && !canEditInactive) {
    // Regular users get 404 for non-active campaigns
    notFound();
  }

  return (
    <>
      <PageHeaderSticky message="Editing" title={campaign.title} />
      {isInactive && (
        <div className="bg-amber-50 border-b border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Editing Draft Campaign
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This campaign is not yet active. Make your changes and submit for approval when ready.
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
