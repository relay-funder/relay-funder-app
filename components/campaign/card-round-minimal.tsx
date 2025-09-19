import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { CampaignItemProps } from '@/types/campaign';
import { Badge } from '@/components/ui/badge';
import { FormattedDate } from '../formatted-date';
import { CampaignMainImage } from './main-image';

import { UserInlineName } from '../user/inline-name';
import { CampaignLocation } from './location';
import { CampaignCardFallback } from './campaign-card';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { useCallback } from 'react';
import { useCampaignCategory } from '@/hooks/use-campaign-category';

export function CampaignCardRoundMinimal({
  campaign,
  round,
  onSelect,
}: CampaignItemProps & { round: GetRoundResponseInstance }) {
  const { isAdmin } = useAuth();
  const { details: categoryDetails } = useCampaignCategory({ campaign });

  const roundCampaign = round.roundCampaigns?.find(
    (roundCampaign) => roundCampaign.campaignId === campaign?.id,
  );
  const onClick = useCallback(async () => {
    if (campaign && typeof onSelect === 'function') {
      onSelect(campaign);
    }
  }, [onSelect, campaign]);

  if (!campaign) {
    return <CampaignCardFallback />;
  }
  return (
    <Card
      className={cn(
        roundCampaign?.status !== 'APPROVED' && !isAdmin && 'opacity-50',
        'flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg',
      )}
      onClick={onClick}
    >
      <CardHeader className="relative p-0">
        <CampaignMainImage campaign={campaign} />
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className="mb-2 line-clamp-1 text-sm font-bold md:text-xl"
              title={campaign?.title ?? 'No Title Set'}
            >
              {campaign?.title ?? 'Campaign Title'}
            </h2>
            {categoryDetails && (
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <span>{categoryDetails.icon}</span>
                <span className="text-xs">{categoryDetails.name}</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="">
          <div className="mb-0 flex items-center justify-between gap-1">
            <div className="align flex gap-2 self-start">
              <UserInlineName user={campaign?.creator} />
            </div>
            <CampaignLocation campaign={campaign} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto grid grid-cols-2 pb-2 pl-6 pr-6 pt-0">
        <div className="">
          {campaign.startTime && (
            <p>
              <strong>Launch:</strong>{' '}
              <FormattedDate date={campaign.startTime} />
            </p>
          )}
        </div>
        <div className="">
          {campaign.endTime && (
            <p>
              <strong>Deadline:</strong>{' '}
              <FormattedDate date={campaign.endTime} />
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
