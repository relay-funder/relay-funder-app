'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, Button } from '@/components/ui';
import { useCampaignCategory } from '@/hooks/use-campaign-category';
import {
  isCampaignDonatable,
  getCampaignStatusInfo,
} from '@/lib/utils/campaign-status';
import { CampaignMainImage } from '../main-image';
import { CampaignCardHeader } from './header';
import { CampaignCardContent } from './content';
import { CampaignCardFooter } from './footer';
import {
  CampaignCardProps,
  getDefaultDisplayOptions,
  validateCampaignCardData,
} from './types';

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
  actionHandlers = {},
  displayOptions: userDisplayOptions = {},
  customButtons,
  disabled = false,
  className,
  children,
}: CampaignCardProps) {
  const { details: categoryDetails } = useCampaignCategory({ campaign });

  // Merge user display options with type defaults
  const displayOptions = {
    ...getDefaultDisplayOptions(type),
    ...userDisplayOptions,
  };

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
  const isAdminType = type === 'admin';
  const isDashboardType = type === 'dashboard';

  // Don't make admin cards clickable (they have action buttons)
  const cardContent = (
    <Card
      className={`flex h-full flex-col overflow-hidden transition-shadow ${isAdminType ? 'hover:shadow-md' : 'cursor-pointer hover:shadow-lg'} ${className || ''}`}
    >
      <CampaignCardHeader
        campaign={campaign}
        displayOptions={displayOptions}
        actionHandlers={actionHandlers}
        isFavorite={isFavorite}
        adminMode={isAdminType}
      />

      <CampaignCardContent
        campaign={campaign}
        displayOptions={displayOptions}
        adminMode={isAdminType}
        dashboardMode={isDashboardType}
        canDonate={canDonate}
        campaignStatusInfo={campaignStatusInfo}
        categoryDetails={categoryDetails}
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
      />
    </Card>
  );

  // Wrap in Link for non-admin cards
  if (!isAdminType && campaign?.slug) {
    return (
      <Link href={`/campaigns/${campaign.slug}`} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
