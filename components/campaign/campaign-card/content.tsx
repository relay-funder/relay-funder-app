import { CardContent } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { Category } from '@/types';
import { CampaignCardDisplayOptions } from './types';
import { MapPin } from 'lucide-react';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';

interface CampaignStatusInfo {
  status: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  description: string;
  canDonate: boolean;
}

interface CampaignCardContentProps {
  campaign: DbCampaign;
  description?: string;
  displayOptions: CampaignCardDisplayOptions;
  adminMode: boolean;
  dashboardMode: boolean;
  canDonate: boolean;
  campaignStatusInfo: CampaignStatusInfo;
  categoryDetails: Category | null;
  children?: React.ReactNode;
  // Round-specific props
  round?: GetRoundResponseInstance;
  roundCampaign?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    id: number;
    campaignId: number;
  };
  cardType?: 'standard' | 'dashboard' | 'admin' | 'round' | 'round-minimal'; // New prop
}

export function CampaignCardContent({
  campaign,
  displayOptions,
  dashboardMode,
  categoryDetails,
  children,
}: CampaignCardContentProps) {
  // Get campaign stats using the hook
  const { amountRaised, amountGoal, progress } = useCampaignStatsFromInstance({
    campaign,
  });

  return (
    <CardContent className="flex-1 p-6">
      <div className="flex h-full flex-col">
        {/* Title - Always exactly 2 lines with minimum height */}
        <div
          className={`mb-4 ${
            dashboardMode ? 'min-h-[3.5rem]' : 'min-h-[4rem]'
          }`}
        >
          <h2
            className={`line-clamp-2 font-semibold leading-tight ${
              dashboardMode ? 'text-lg' : 'text-xl'
            }`}
            title={campaign?.title ?? 'No Title Set'}
          >
            {campaign?.title ?? 'Campaign Title'}
          </h2>
        </div>

        {/* Spacer to push bottom content down */}
        <div className="flex-1" />

        {/* Bottom section - Always aligned consistently */}
        <div className="space-y-3">
          {/* Category and Country */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {categoryDetails && (
                <>
                  <span className="text-base">{categoryDetails.icon}</span>
                  <span className="font-medium">{categoryDetails.name}</span>
                </>
              )}
            </div>
            {campaign?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{campaign.location}</span>
              </div>
            )}
          </div>

          {/* Funding Progress - Only show if enabled */}
          {displayOptions.showFundingProgress !== false && (
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-green-600 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* Funding Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {amountRaised}
                  </span>
                  <span className="text-gray-500">raised</span>
                </div>
                <span className="text-gray-500">
                  of{' '}
                  <span className="text-base font-semibold">{amountGoal}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom children content */}
      {children}
    </CardContent>
  );
}
