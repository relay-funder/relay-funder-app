import { CardHeader } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { FavoriteButton } from '@/components/favorite-button';
import { CampaignMainImage } from '../main-image';
import { CampaignMainImageCard } from '../main-image-card';
import { CampaignStatus } from '../status';
import { CampaignCardActions, CampaignCardDisplayOptions } from './types';
import { CampaignInfoDialog } from '../info';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  statusIndicators,
  adminControls,
}: CampaignCardHeaderProps) {
  return (
    <CardHeader className="relative p-0" style={{ pointerEvents: 'auto' }}>
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

      {displayOptions.showStatusBadge && (
        <div className="absolute bottom-4 left-4 z-10">
          <CampaignStatus campaign={campaign} />
        </div>
      )}

      {/* Withdrawal Authorization Badge - Admin only, for ACTIVE/COMPLETED/FAILED campaigns */}
      {adminMode &&
        campaign.treasuryAddress &&
        (campaign.status === 'ACTIVE' ||
          campaign.status === 'COMPLETED' ||
          campaign.status === 'FAILED') && (
          <div className="absolute right-4 top-4 z-20">
            {campaign.treasuryWithdrawalsEnabled ? (
              <Badge className="bg-green-600 text-xs hover:bg-green-700">
                Withdrawals Enabled
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-muted/50 text-xs text-muted-foreground"
              >
                Withdrawals Disabled
              </Badge>
            )}
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

      {/* Info icon - positioned outside main click area with explicit pointer events */}
      {displayOptions.showInfoIcon && (
        <div
          className="absolute bottom-2 right-2 z-30"
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
          }}
        >
          <CampaignInfoDialog campaign={campaign}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-pointer rounded-full bg-white/90 p-0 text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-gray-900 hover:shadow-md"
              aria-label="View campaign details"
              tabIndex={0}
              style={{
                pointerEvents: 'auto',
              }}
            >
              <Info className="h-4 w-4" style={{ pointerEvents: 'none' }} />
            </Button>
          </CampaignInfoDialog>
        </div>
      )}
    </CardHeader>
  );
}
