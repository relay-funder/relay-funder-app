import { Badge } from '@/components/ui/badge';
import { DbCampaign } from '@/types/campaign';
import { CampaignCardDisplayOptions } from './types';

interface CampaignCardBadgesProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  canDonate: boolean;
  campaignStatusInfo: any;
  categoryDetails: any;
  adminMode: boolean;
}

export function CampaignCardBadges({
  campaign,
  displayOptions,
  canDonate,
  campaignStatusInfo,
  categoryDetails,
  adminMode,
}: CampaignCardBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Category badge - Clean and prominent */}
      {displayOptions.showCategoryBadge && categoryDetails && (
        <Badge variant="secondary" className="text-xs font-medium">
          <span className="mr-1">{categoryDetails.icon}</span>
          {categoryDetails.name}
        </Badge>
      )}

      {/* Status badge - Only visible to admins */}
      {displayOptions.showStatusBadge && adminMode && !canDonate && (
        <Badge variant={campaignStatusInfo.variant} className="text-xs">
          {campaignStatusInfo.status}
        </Badge>
      )}
    </div>
  );
}
