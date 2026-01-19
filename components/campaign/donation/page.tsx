'use client';
import { useEffect, useRef } from 'react';
import { notFound } from 'next/navigation';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from '@/components/campaign/loading';
import { DonationProvider, useAuth } from '@/contexts';
import { PageHeaderSticky } from '@/components/page/header-sticky';
import { DetailContainer } from '@/components/layout';
import { CampaignDonationForm } from './form';
import { CampaignDonationSummary } from './campaign-summary';
import { CampaignMatchingFundsHighlight } from '@/components/campaign/matching-funds-highlight';
import { NotStartedYet } from '@/components/campaign//not-started-yet';
import { CampaignStatus } from '@/components/campaign/status';
import { Web3ContextProvider } from '@/lib/web3';
import { Info } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export function CampaignDonationPage({ slug }: { slug: string }) {
  const { address, isAdmin } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    trackEvent('funnel_donation_page_view', {
      path: `/campaigns/${slug}/donate`,
    });
  }, [slug]);

  if (isPending) {
    return <CampaignLoading />;
  }
  const campaign = campaignInstance?.campaign;
  if (!campaign) {
    notFound();
  }
  const canViewInactive = address === campaign.creatorAddress || isAdmin;
  const isInactive = campaign.status !== 'ACTIVE';

  if (isInactive && !canViewInactive) {
    // Regular users get 404 for non-active campaigns
    notFound();
  }
  if (new Date(campaign.startTime).getTime() > Date.now()) {
    return <NotStartedYet campaign={campaign} />;
  }

  return (
    <>
      <PageHeaderSticky message="Campaign" title="" />
      <main className="w-full">
        <DetailContainer variant="standard" padding="md">
          <Web3ContextProvider>
            <DonationProvider>
              <div className="rounded-lg border bg-card p-8 shadow-sm">
                {isInactive && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Campaign Preview - Donations Not Available
                          </p>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            This campaign is not yet active. You cannot make
                            donations at this time.
                          </p>
                        </div>
                      </div>
                      <CampaignStatus campaign={campaign} />
                    </div>
                  </div>
                )}
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <CampaignDonationForm campaign={campaign} />
                  </div>
                  <div className="space-y-4 lg:col-span-1">
                    <CampaignDonationSummary campaign={campaign} />
                    <CampaignMatchingFundsHighlight
                      campaign={campaign}
                      variant="compact"
                    />
                  </div>
                </div>
              </div>
            </DonationProvider>
          </Web3ContextProvider>
        </DetailContainer>
      </main>
    </>
  );
}
