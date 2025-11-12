'use client';
import { notFound } from 'next/navigation';
import { PageHome } from '@/components/page/home';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from '@/components/campaign/loading';
import { DonationProvider, useAuth, useDonationContext } from '@/contexts';
import { CampaignError } from '@/components/campaign/error';
import { PageHeaderSticky } from '@/components/page/header-sticky';
import { DetailContainer } from '@/components/layout';
import { CampaignDonationForm } from './form';
import { CampaignDonationSummary } from './campaign-summary';
import { CampaignMatchingFundsHighlight } from '@/components/campaign/matching-funds-highlight';
import { FeeInformation } from '@/components/shared/fee-information';
import { NotStartedYet } from '@/components/campaign//not-started-yet';
import { Web3ContextProvider } from '@/lib/web3';

function FeeInformationCompact() {
  const { paymentType, amount } = useDonationContext();

  return (
    <div className="mt-4">
      <FeeInformation
        isDaimoPay={paymentType === 'daimo'}
        isWalletDonation={paymentType === 'wallet'}
        donationAmount={
          parseFloat(amount || '0') > 0 ? parseFloat(amount || '0') : undefined
        }
        compact={true}
      />
    </div>
  );
}

export function CampaignDonationPage({ slug }: { slug: string }) {
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
                    <FeeInformationCompact />
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
