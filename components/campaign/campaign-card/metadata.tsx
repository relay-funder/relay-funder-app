import { DbCampaign } from '@/types/campaign';
import { UserInlineName } from '../../user/inline-name';
import { CampaignLocation } from '../location';
import { CampaignRoundBadge } from '../round-badge';
import { CampaignCardDisplayOptions } from './types';

interface CampaignCardMetadataProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
}

export function CampaignCardMetadata({
  campaign,
  displayOptions,
}: CampaignCardMetadataProps) {
  return (
    <div className="space-y-3">
      {/* Creator and Location Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>by</span>
          <UserInlineName user={campaign?.creator} />
        </div>
        <CampaignLocation campaign={campaign} />
      </div>

      {/* Description - Clean and readable */}
      <p
        className={`text-sm leading-relaxed text-gray-700 ${
          displayOptions.truncateDescription ? 'line-clamp-2' : ''
        }`}
      >
        {campaign?.description}
      </p>

      {/* Round Information - Below description, before progress */}
      {displayOptions.showRoundsIndicator && (
        <div className="pt-2">
          <CampaignRoundBadge
            campaign={campaign}
            variant="detailed"
            className="w-full justify-center"
          />
        </div>
      )}
    </div>
  );
}
