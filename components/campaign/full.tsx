'use client';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page/header';
import { CampaignMainImage } from '@/components/campaign/main-image';
import { CampaignFundingBox } from '@/components/campaign/funding-box';
import { CampaignDetailsBox } from '@/components/campaign/details-box';
import { CampaignMatchingFundsHighlight } from '@/components/campaign/matching-funds-highlight';
import { CampaignDetailTabs } from '@/components/campaign/detail-tabs';
import { CampaignDetailCard } from '@/components/campaign/detail-card';
import { PageHome } from '@/components/page/home';
import { DetailContainer } from '@/components/layout';
import { CampaignLocation } from '@/components/campaign/location';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { CampaignLoading } from './loading';
import { useAuth } from '@/contexts';
import { CampaignError, CampaignStatusError } from './error';
import { isCampaignFeatured } from '@/lib/utils/campaign-status';
import { FavoriteButton } from '@/components/favorite-button';
import { ShareDialog } from '@/components/share-dialog';
import { CampaignInfoDialog } from '@/components/campaign/info';
import { CampaignStatus } from '@/components/campaign/status';
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
  const canViewInactive = address === campaign.creatorAddress || isAdmin;
  const isInactive = campaign.status !== 'ACTIVE';

  if (isInactive && !canViewInactive) {
    // Regular users get 404 for non-active campaigns
    notFound();
  }

  // Navigation header without title
  const navHeader = <PageHeader featured={isCampaignFeatured(campaign)} />;

  return (
    <PageHome header={navHeader}>
      <DetailContainer variant="wide" padding="sm">
        {/* Desktop Layout: Original Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column: Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Top Section: Image and Title Box */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-lg shadow-sm">
                  <CampaignMainImage campaign={campaign} />
                </div>
              </div>

              {/* Title and Location Box */}
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-foreground lg:text-3xl">
                        {campaign.title}
                      </h1>
                      {isInactive && (
                        <div className="flex-shrink-0">
                          <CampaignStatus campaign={campaign} />
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <CampaignLocation campaign={campaign} />
                    </div>
                    {isInactive && (
                      <div className="mt-3">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          <Info className="h-4 w-4" />
                          <span>
                            This campaign is not yet active. Only you and admins can view it.
                          </span>
                        </div>
                      </div>
                    )}
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
            <CampaignDetailCard
              title="About this campaign"
              text={campaign.description}
            />

            {/* Use of funds Section */}
            {campaign.fundingUsage && (
              <CampaignDetailCard
                title="Use of funds"
                text={campaign.fundingUsage}
              />
            )}

            {/* Tabs Section */}
            <div className="rounded-lg border bg-card p-4 shadow-sm">
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
          <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold leading-tight tracking-tight">
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
          <CampaignDetailCard
            title="About this campaign"
            text={campaign.description}
          />

          {/* Use of funds Section */}
          {campaign.fundingUsage && (
            <CampaignDetailCard
              title="Use of funds"
              text={campaign.fundingUsage}
            />
          )}

          {/* Tabs Section */}
          <div className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
            <CampaignDetailTabs campaign={campaign} />
          </div>
        </div>
      </DetailContainer>
    </PageHome>
  );
}
