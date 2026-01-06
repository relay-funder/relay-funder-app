'use client';

import { Button } from '@/components/ui';
import { Info, Users, Clock } from 'lucide-react';
import { CampaignMainImage } from '@/components/campaign/main-image';
import { CampaignInfoDialog } from '@/components/campaign/info';
import { CampaignLocation } from '@/components/campaign/location';
import { CampaignDaysLeft } from '@/components/campaign/days-left';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { formatUSD } from '@/lib/format-usd';
import { ReadMoreOrLess } from '@/components/read-more-or-less';
import type { DbCampaign } from '@/types/campaign';

export function CampaignDonationSummary({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { amountRaisedFloat, amountGoalFloat, progress, contributorCount } =
    useCampaignStatsFromInstance({ campaign });

  // Ensure we have valid numbers with fallbacks
  const safeAmountRaised = amountRaisedFloat || 0;
  const safeAmountGoal = amountGoalFloat || 0;
  const safeProgress = progress || 0;
  const safeContributorCount = contributorCount || 0;

  return (
    <div className="space-y-4">
      {/* Campaign Image */}
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <CampaignMainImage campaign={campaign} />
      </div>

      {/* Campaign Info */}
      <div className="space-y-4">
        {/* Title and Info Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 font-display text-lg font-semibold text-foreground">
              {campaign.title}
            </h2>
            <div className="mt-1">
              <CampaignLocation campaign={campaign} />
            </div>
          </div>
          <CampaignInfoDialog campaign={campaign}>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full"
              aria-label="View campaign details"
            >
              <Info className="h-4 w-4" />
            </Button>
          </CampaignInfoDialog>
        </div>

        {/* Description */}
        {campaign.description && (
          <div className="text-sm text-muted-foreground">
            <ReadMoreOrLess
              className="text-sm text-muted-foreground"
              collapsedClassName="line-clamp-3"
            >
              {campaign.description}
            </ReadMoreOrLess>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">
              {formatUSD(safeAmountRaised)} raised
            </span>
            <span className="text-muted-foreground">
              of {formatUSD(safeAmountGoal)} goal
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-quantum transition-all duration-300"
              style={{ width: `${Math.min(safeProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{safeContributorCount} backers</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <CampaignDaysLeft campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
  );
}
