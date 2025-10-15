'use client';
import { notFound } from 'next/navigation';
import { PageHome } from '@/components/page/home';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from '@/components/campaign/loading';
import { useAuth } from '@/contexts';
import { CampaignError } from '@/components/campaign/error';
import { PageHeaderSticky } from '@/components/page/header-sticky';
import { DetailContainer } from '@/components/layout';
import { CampaignDonationSummary } from './campaign-summary';
import { CampaignMatchingFundsHighlight } from '@/components/campaign/matching-funds-highlight';
import { PaymentStatus } from '@/components/payment/status';
import { PaymentStatusLoading } from '@/components/payment/status-loading';
import { Suspense } from 'react';

export function CampaignDonationSuccessPage({ slug }: { slug: string }) {
  const { address, isAdmin } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  if (isPending) {
    return <CampaignLoading />;
  }
  const campaign = campaignInstance?.campaign;
  if (!campaign) {
    notFound();
  }
  if (
    campaign.status !== 'ACTIVE' &&
    address !== campaign.creatorAddress &&
    !isAdmin
  ) {
    // admins and campaign owners can see inactive campaigns, everyone else
    // will get an error
    return (
      <PageHome header="">
        <CampaignError error="Not Active" />
      </PageHome>
    );
  }

  return (
    <>
      <PageHeaderSticky message="Campaign" title="" />
      <main className="w-full">
        <DetailContainer variant="standard" padding="md">
          <div className="rounded-lg border bg-white p-8 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Suspense fallback={<PaymentStatusLoading />}>
                  <PaymentStatus />
                </Suspense>
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
        </DetailContainer>
      </main>
    </>
  );
}
