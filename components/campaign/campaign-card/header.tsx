import { CardHeader } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
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
}

export function CampaignCardHeader({
  campaign,
  displayOptions,
  actionHandlers,
  isFavorite,
  adminMode,
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

      {displayOptions.showRemoveButton && (
        <div className="absolute right-4 top-16 z-10">
          <CampaignRemoveButton campaign={campaign} />
        </div>
      )}

      {displayOptions.showStatusBadge && adminMode && (
        <div className={`absolute z-10 ${adminMode ? 'pl-1' : 'left-4 top-4'}`}>
          <CampaignStatus campaign={campaign} />
        </div>
      )}
    </CardHeader>
  );
}
