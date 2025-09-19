import { CardContent } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { CampaignCardDisplayOptions } from './types';
import { CampaignCardBadges } from './badges';
import { CampaignCardMetadata } from './metadata';

interface CampaignCardContentProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  adminMode: boolean;
  dashboardMode: boolean;
  canDonate: boolean;
  campaignStatusInfo: any;
  categoryDetails: any;
  children?: React.ReactNode;
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
}: CampaignCardContentProps) {
  return (
    <CardContent className="flex-1 p-6">
      <div className="space-y-3">
        {/* Title - Full width, no truncation */}
        <h2
          className={`font-semibold leading-tight ${
            dashboardMode ? 'text-lg' : 'text-xl'
          }`}
          title={campaign?.title ?? 'No Title Set'}
        >
          {campaign?.title ?? 'Campaign Title'}
        </h2>

        {/* Category and Status Badges */}
        <CampaignCardBadges
          campaign={campaign}
          displayOptions={displayOptions}
          canDonate={canDonate}
          campaignStatusInfo={campaignStatusInfo}
          categoryDetails={categoryDetails}
          adminMode={adminMode}
        />

        {/* Round information moved to below description */}

        {/* Creator and Location Metadata */}
        <CampaignCardMetadata
          campaign={campaign}
          displayOptions={displayOptions}
          adminMode={adminMode}
          dashboardMode={dashboardMode}
        />
      </div>

      {/* Custom children content */}
      {children}
    </CardContent>
  );
}
