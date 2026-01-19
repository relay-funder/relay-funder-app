'use client';

import Link from 'next/link';
import { Card, CardContent, Button } from '@/components/ui';
import { useCampaignCategory } from '@/hooks/use-campaign-category';
import {
  isCampaignDonatable,
  getCampaignStatusInfo,
} from '@/lib/utils/campaign-status';
import { CampaignCardHeader } from './header';
import { CampaignCardContent } from './content';
import { CampaignCardFooter } from './footer';
import {
  CampaignCardProps,
  getDefaultDisplayOptions,
  validateCampaignCardData,
} from './types';
import { trackEvent } from '@/lib/analytics';

/**
 * Campaign Card Component
 *
 * A unified, composable component for displaying campaign cards across the application.
 * Uses a type-based approach for common configurations with fine-grained override options.
 *
 * @example
 * ```tsx
 * // Standard campaign card
 * <CampaignCard campaign={campaign} />
 *
 * // Dashboard type with favorite functionality
 * <CampaignCard
 *   campaign={campaign}
 *   type="dashboard"
 *   isFavorite={isFavorite}
 *   actionHandlers={{ onFavoriteToggle: handleFavoriteToggle }}
 * />
 *
 * // Admin type with management actions
 * <CampaignCard
 *   campaign={campaign}
 *   type="admin"
 *   actionHandlers={{
 *     onApprove: handleApprove,
 *     onDisable: handleDisable
 *   }}
 * />
 *
 * // Custom configuration with overrides
 * <CampaignCard
 *   campaign={campaign}
 *   type="standard"
 *   disabled={true}
 *   displayOptions={{ showDates: true }}
 *   customButtons={<MyCustomButtons />}
 * />
 * ```
 */
export function CampaignCard({
  campaign,
  type = 'standard',
  isFavorite,
  description,
  actionHandlers = {},
  displayOptions: userDisplayOptions = {},
  customButtons,
  disabled = false,
  className,
  children,
  // Round-specific props
  round,
  statusIndicators,
  adminControls,
  roundAdminFooterControls,
  onSelect,
}: CampaignCardProps) {
  const { details: categoryDetails } = useCampaignCategory({ campaign });

  // Merge user display options with type defaults
  const displayOptions = {
    ...getDefaultDisplayOptions(type),
    ...userDisplayOptions,
  };

  // Round-specific logic
  const isRoundType = type?.startsWith('round');
  const roundCampaign = round?.roundCampaigns?.find(
    (rc) => rc.campaignId === campaign?.id,
  );

  // Runtime validation of campaign data
  if (campaign && !validateCampaignCardData(campaign)) {
    console.warn('CampaignCard: Invalid campaign data structure:', campaign);
  }

  // Show fallback state when no campaign provided
  if (!campaign) {
    return (
      <Card
        className={`flex h-full flex-col overflow-hidden border-dashed border-gray-300 bg-gray-50 ${className || ''}`}
      >
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">No campaign data provided</p>
            {actionHandlers.onCreate && (
              <Button
                variant="outline"
                size="sm"
                onClick={actionHandlers.onCreate}
                className="mt-2"
              >
                Create Campaign
              </Button>
            )}
          </div>
        </CardContent>
        {children}
      </Card>
    );
  }

  // Get campaign status info for donation logic
  const campaignStatusInfo = getCampaignStatusInfo(campaign);
  const canDonate = isCampaignDonatable(campaign);
  const isAdminType = type === 'admin' || type === 'round';
  const isDashboardType = type === 'dashboard';
  const isRoundMinimalType = type === 'round-minimal';

  // Handle round-specific dimming for non-approved campaigns
  const shouldDimCard =
    displayOptions.dimNonApproved &&
    isRoundType &&
    roundCampaign?.status !== 'APPROVED' &&
    !actionHandlers.onRoundApprove; // Don't dim if user has admin controls

  // Don't make admin, dashboard, or round-minimal cards clickable (they have action buttons)
  // Round-minimal cards have onSelect behavior instead of navigation
  const isClickable = !isAdminType && !isDashboardType && !isRoundMinimalType;

  const cardContent = (
    <Card
      className={`flex h-full min-h-[400px] flex-col overflow-hidden transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md'
          : 'hover:shadow-md'
      } ${shouldDimCard ? 'opacity-50' : ''} ${className || ''}`}
      onClick={
        isRoundMinimalType && onSelect ? () => onSelect(campaign) : undefined
      }
    >
      <CampaignCardHeader
        campaign={campaign}
        displayOptions={displayOptions}
        actionHandlers={actionHandlers}
        isFavorite={isFavorite}
        adminMode={isAdminType}
        round={round}
        roundCampaign={roundCampaign}
        statusIndicators={statusIndicators}
        adminControls={adminControls}
      />

      <CampaignCardContent
        campaign={campaign}
        description={description}
        displayOptions={displayOptions}
        adminMode={isAdminType}
        dashboardMode={isDashboardType}
        canDonate={canDonate}
        campaignStatusInfo={campaignStatusInfo}
        categoryDetails={categoryDetails ?? null}
        round={round}
        roundCampaign={roundCampaign}
        cardType={type}
      >
        {children}
      </CampaignCardContent>

      <CampaignCardFooter
        campaign={campaign}
        displayOptions={displayOptions}
        adminMode={isAdminType}
        showButtons={!disabled && isAdminType} // Only show buttons in admin mode
        customButtons={customButtons}
        canDonate={canDonate}
        campaignStatusInfo={campaignStatusInfo}
        round={round}
        roundCampaign={roundCampaign}
        roundAdminFooterControls={roundAdminFooterControls}
        cardType={type}
      />
    </Card>
  );

  // Wrap in Link for non-admin and non-round-minimal cards
  if (isClickable && campaign?.slug && !isRoundMinimalType) {
    const linkTarget = displayOptions.openLinksInNewTab ? '_blank' : undefined;
    return (
      <Link
        href={`/campaigns/${campaign.slug}`}
        className="block transition-opacity active:opacity-75"
        target={linkTarget}
        onClick={() => {
          trackEvent('funnel_cta_click', {
            path: `/campaigns/${campaign.slug}`,
          });
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
