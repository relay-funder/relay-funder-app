'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { CampaignMainImage } from '@/components/campaign/main-image';
import { CampaignFundingBox } from '@/components/campaign/funding-box';
import { CampaignDetailsBox } from '@/components/campaign/details-box';
import { CampaignMatchingFundsHighlight } from '@/components/campaign/matching-funds-highlight';
import { CampaignDetailTabs } from '@/components/campaign/detail-tabs';
import { CampaignDetailTabAbout } from '@/components/campaign/detail-tab-about';
import { PageHome } from '@/components/page/home';
import { DetailContainer } from '@/components/layout';
import { CampaignLocation } from '@/components/campaign/location';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from './loading';
import { useAuth } from '@/contexts';
import { CampaignError } from './error';
import { isCampaignFeatured } from '@/lib/utils/campaign-status';
import { FavoriteButton } from '@/components/favorite-button';
import { ShareDialog } from '@/components/share-dialog';
import { CampaignInfoDialog } from '@/components/campaign/info';
import { Button } from '@/components/ui';
import { Info } from 'lucide-react';

export function CampaignFull({ slug }: { slug: string }) {
  const { address, isAdmin, isReady } = useAuth();
  const { data: campaignInstance, isPending } = useCampaign(slug);
  if (isPending || !isReady) {
    return (
      <PageHome header={<PageHeader />}>
        <DetailContainer variant="wide" padding="md">
          <CampaignLoading variant="detail" />
        </DetailContainer>
      </PageHome>
    );
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

  // Navigation header without title
  const navHeader = <PageHeader featured={isCampaignFeatured(campaign)} />;

  return (
    <PageHome header={navHeader}>
      <DetailContainer variant="wide" padding="sm">
        {/* Desktop Layout: Original Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2">
            {/* Top Section: Image and Title Box */}
            <div className="mb-8 space-y-6">
              {/* Main Image */}
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-lg shadow-sm">
                  <CampaignMainImage campaign={campaign} />
                </div>
              </div>

              {/* Title and Location Box */}
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold leading-tight tracking-tight lg:text-3xl">
                      {campaign.title}
                    </h1>
                    <div className="mt-2">
                      <CampaignLocation campaign={campaign} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShareDialog campaign={campaign} />
                    <FavoriteButton campaignId={campaign.id} />
                    <CampaignInfoDialog campaign={campaign}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        aria-label="View campaign details"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </CampaignInfoDialog>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section - Separate from tabs */}
            <div className="mb-8">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <CampaignDetailTabAbout campaign={campaign} />
              </div>
            </div>

            {/* Tabs Section */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <CampaignDetailTabs campaign={campaign} />
            </div>
          </div>

          {/* Right Column: Campaign Cards */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <CampaignFundingBox campaign={campaign} />
              <CampaignDetailsBox campaign={campaign} />
              <CampaignMatchingFundsHighlight campaign={campaign} />
            </div>
          </div>
        </div>

        {/* Mobile Layout: Reordered Flow */}
        <div
          className="block space-y-6 lg:hidden"
          style={{ marginTop: '-30px' }}
        >
          {/* Main Image */}
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-lg shadow-sm">
              <CampaignMainImage campaign={campaign} />
            </div>
          </div>

          {/* Title and Location Box */}
          <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold leading-tight tracking-tight">
                  {campaign.title}
                </h1>
                <div className="mt-2">
                  <CampaignLocation campaign={campaign} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShareDialog campaign={campaign} />
                <FavoriteButton campaignId={campaign.id} />
                <CampaignInfoDialog campaign={campaign}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    aria-label="View campaign details"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </CampaignInfoDialog>
              </div>
            </div>
          </div>

          {/* Mobile: Funding Progress Right After Image */}
          <div className="space-y-4">
            <CampaignFundingBox campaign={campaign} />
            <CampaignDetailsBox campaign={campaign} />
            <CampaignMatchingFundsHighlight campaign={campaign} />
          </div>

          {/* About Section */}
          <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
            <CampaignDetailTabAbout campaign={campaign} />
          </div>

          {/* Tabs Section */}
          <div className="rounded-lg border bg-white p-4 shadow-sm sm:p-6">
            <CampaignDetailTabs campaign={campaign} />
          </div>
        </div>
      </DetailContainer>
    </PageHome>
  );
}
