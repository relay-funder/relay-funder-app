import { CardHeader } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FavoriteButton } from '@/components/favorite-button';
import { CampaignMainImage } from '../main-image';
import { CampaignMainImageCard } from '../main-image-card';
import { CampaignStatus } from '../status';
import { CampaignRemoveButton } from '../remove-button';
import { CampaignCardActions, CampaignCardDisplayOptions } from './types';

interface CampaignCardHeaderProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  actionHandlers: CampaignCardActions;
  isFavorite?: boolean;
  adminMode: boolean;
  // Round-specific props
  round?: GetRoundResponseInstance;
  roundCampaign?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    id: number;
    campaignId: number;
  };
  statusIndicators?: React.ReactNode;
  adminControls?: React.ReactNode;
}

export function CampaignCardHeader({
  campaign,
  displayOptions,
  actionHandlers,
  isFavorite,
  adminMode,
  round,
  roundCampaign,
  statusIndicators,
  adminControls,
}: CampaignCardHeaderProps) {
  return (
    <CardHeader className="relative p-0">
      {displayOptions.useCardImage ? (
        <CampaignMainImageCard campaign={campaign} />
      ) : (
        <CampaignMainImage campaign={campaign} />
      )}

      {/* Overlay elements based on display options */}
      {displayOptions.showFavoriteButton && actionHandlers.onFavoriteToggle && (
        <div className="absolute right-4 top-4 z-10">
          <FavoriteButton
            campaignId={campaign.id}
            initialIsFavorite={isFavorite}
            onToggle={actionHandlers.onFavoriteToggle}
          />
        </div>
      )}

      {displayOptions.showStatusBadge && adminMode && (
        <div className="absolute bottom-4 left-4 z-10">
          <CampaignStatus campaign={campaign} />
        </div>
      )}

      {/* Round-specific status indicators */}
      {displayOptions.showRoundStatus && statusIndicators && (
        <div className="absolute left-4 top-4 z-10">{statusIndicators}</div>
      )}

      {/* Round-specific admin controls */}
      {displayOptions.showRoundAdminControls && adminControls && (
        <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-md bg-black/20 p-1 backdrop-blur-sm">
          {adminControls}
        </div>
      )}
    </CardHeader>
  );
}
