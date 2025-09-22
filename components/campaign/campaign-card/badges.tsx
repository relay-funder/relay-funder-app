import { Badge } from '@/components/ui/badge';
import { DbCampaign } from '@/types/campaign';
import { Category } from '@/types';
import { CampaignCardDisplayOptions } from './types';

interface CampaignStatusInfo {
  status: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  description: string;
  canDonate: boolean;
}

interface CampaignCardBadgesProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  canDonate: boolean;
  campaignStatusInfo: CampaignStatusInfo;
  categoryDetails: Category | null;
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
      {/* Featured badge - highlighted when within featured window */}
      {(() => {
        const now = new Date();
        const featured =
          campaign?.featuredStart &&
          new Date(campaign.featuredStart) <= now &&
          (!campaign.featuredEnd || new Date(campaign.featuredEnd) >= now);
        return featured ? (
          <Badge variant="default" className="text-xs font-medium">
            Featured
          </Badge>
        ) : null;
      })()}

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
