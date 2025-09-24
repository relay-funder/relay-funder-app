import { CardContent } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { Category } from '@/types';
import { CampaignCardDisplayOptions } from './types';
import { CampaignCardBadges } from './badges';
import { CampaignCardMetadata } from './metadata';

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
  description,
  displayOptions,
  adminMode,
  dashboardMode,
  canDonate,
  campaignStatusInfo,
  categoryDetails,
  children,
  round,
  roundCampaign,
  cardType = 'standard',
}: CampaignCardContentProps) {
  return (
    <CardContent className="flex-1 p-6">
      <div className="space-y-4">
        {/* Title - Primary hierarchy */}
        <h2
          className={`font-semibold leading-tight ${
            dashboardMode ? 'text-lg' : 'text-xl'
          }`}
          title={campaign?.title ?? 'No Title Set'}
        >
          {campaign?.title ?? 'Campaign Title'}
        </h2>

        {/* Key metadata badges - Secondary hierarchy */}
        <CampaignCardBadges
          campaign={campaign}
          displayOptions={displayOptions}
          canDonate={canDonate}
          campaignStatusInfo={campaignStatusInfo}
          categoryDetails={categoryDetails}
          adminMode={adminMode}
        />

        {/* Creator and description - Tertiary hierarchy */}
        <CampaignCardMetadata
          campaign={campaign}
          displayOptions={displayOptions}
          cardType={cardType}
        />

        {/* Custom description prop - only when showDescription is enabled */}
        {displayOptions.showDescription && description && (
          <div className="text-sm leading-relaxed text-gray-700">
            {description}
          </div>
        )}
      </div>

      {/* Custom children content */}
      {children}
    </CardContent>
  );
}
