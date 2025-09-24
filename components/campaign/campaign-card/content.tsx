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
}

export function CampaignCardContent({
  campaign,
  displayOptions,
  adminMode,
  dashboardMode,
  canDonate,
  campaignStatusInfo,
  categoryDetails,
  children,
  round,
  roundCampaign,
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
        />
      </div>

      {/* Custom children content */}
      {children}
    </CardContent>
  );
}
