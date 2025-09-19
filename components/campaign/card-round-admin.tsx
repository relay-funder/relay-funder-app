import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Badge,
} from '@/components/ui';

import Image from 'next/image';
import Link from 'next/link';

import { CampaignMainImageCard } from '@/components/campaign/main-image-card';
import { CampaignItemProps } from '@/types/campaign';
import { FormattedDate } from '../formatted-date';
import { CampaignProgress } from './progress';
import { UserInlineName } from '../user/inline-name';
import { CampaignLocation } from './location';
import { CampaignRoundBadge } from './round-badge';
import { useCampaignCategory } from '@/hooks/use-campaign-category';
import {
  isCampaignDonatable,
  getCampaignStatusInfo,
} from '@/lib/utils/campaign-status';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';

// Admin functionality imports
import { RoundCardCampaignRemoveButton } from '@/components/round/card-campaign-remove-button';
import { RoundCardCampaignStatus } from '@/components/round/card-campaign-status';
import { RoundCardCampaignAdminApproveButton } from '@/components/round/card-campaign-admin-approve-button';
import { RoundCardCampaignAdminRejectButton } from '@/components/round/card-campaign-admin-reject-button';

export function CampaignCardRoundAdmin({
  campaign,
  round,
}: CampaignItemProps & { round: GetRoundResponseInstance }) {
  const { isAdmin } = useAuth();
  const { details: categoryDetails } = useCampaignCategory({ campaign });
  const campaignStatusInfo = getCampaignStatusInfo(campaign);
  const canDonate = isCampaignDonatable(campaign);

  const roundCampaign = round.roundCampaigns?.find(
    (roundCampaign) => roundCampaign.campaignId === campaign?.id,
  );

  if (!campaign) {
    return (
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex-1">
          <CardHeader className="p-0">
            <CampaignMainImageCard campaign={campaign} />
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="mb-2 line-clamp-1 text-xl font-bold">
                Create Campaign
              </h2>
            </div>
            <div className="mb-2 flex items-center justify-between gap-1"></div>
            <p className="line-clamp-3 text-[12px] text-gray-600">
              Create a Campaign
            </p>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        // Dim non-approved campaigns for non-admin users
        roundCampaign?.status !== 'APPROVED' && !isAdmin && 'opacity-50',
        'flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg',
      )}
    >
      <CardHeader className="relative p-0">
        <CampaignMainImageCard campaign={campaign} />

        {/* Admin Controls - positioned as a horizontal row at top right */}
        {isAdmin && (
          <div className="absolute right-2 top-2 z-10 flex gap-1 rounded-md bg-black/20 p-1 backdrop-blur-sm">
            <RoundCardCampaignAdminApproveButton
              campaign={campaign}
              round={round}
            />
            <RoundCardCampaignAdminRejectButton
              campaign={campaign}
              round={round}
            />
            <RoundCardCampaignRemoveButton campaign={campaign} round={round} />
          </div>
        )}

        {/* Campaign Status Badge */}
        <div className="absolute left-4 top-4 z-10">
          <RoundCardCampaignStatus campaign={campaign} round={round} />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className="mb-2 line-clamp-1 text-xl font-bold"
              title={campaign?.title ?? 'No Title Set'}
            >
              {campaign?.title ?? 'Campaign Title'}
            </h2>
            {/* Campaign Status Badge - Always show for admins */}
            <Badge variant={campaignStatusInfo.variant} className="ml-2">
              {campaignStatusInfo.status}
            </Badge>
            {categoryDetails && (
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <span>{categoryDetails.icon}</span>
                <span className="text-xs">{categoryDetails.name}</span>
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="align flex gap-2 self-start">
              <UserInlineName user={campaign?.creator} />
            </div>
            <CampaignLocation campaign={campaign} />
          </div>
          <div className="mb-2 flex items-end justify-end gap-1">
            <CampaignRoundBadge campaign={campaign} variant="compact" />
          </div>
          <p className="line-clamp-3 text-[12px] text-gray-600">
            {campaign?.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="mb-4 cursor-pointer items-center gap-2 text-[14px] text-black underline decoration-black hover:text-gray-600">
              <Link href={`/campaigns/${campaign.slug}`} target="_blank">
                Read More
              </Link>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-4 p-6 pt-0">
        <div className="w-full flex-1 space-y-2 py-4">
          {/* Campaign Timeline Info */}
          {campaign.startTime && (
            <p className="text-sm text-muted-foreground">
              <strong>Launch:</strong>{' '}
              <FormattedDate date={campaign.startTime} />
            </p>
          )}
          {campaign.endTime && (
            <p className="text-sm text-muted-foreground">
              <strong>Deadline:</strong>{' '}
              <FormattedDate date={campaign.endTime} />
            </p>
          )}

          <CampaignProgress campaign={campaign} />
        </div>
        <div className="flex w-full flex-row align-middle">
          {canDonate ? (
            <Link
              href={`/campaigns/${campaign.slug}/donation`}
              className="flex-1"
            >
              <button className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700">
                <Image src="/diamond.png" alt="wallet" width={24} height={24} />
                Donate
              </button>
            </Link>
          ) : (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-gray-400 px-4 py-2 text-white"
              title={`${campaignStatusInfo.description} - Only active campaigns can accept donations`}
            >
              <Image
                src="/diamond.png"
                alt="wallet"
                width={24}
                height={24}
                className="opacity-50"
              />
              {campaignStatusInfo.status}
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
