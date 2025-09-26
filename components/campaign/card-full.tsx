'use client';

import type { DbCampaign } from '@/types/campaign';
import Link from 'next/link';

import { Card, CardContent, Button } from '@/components/ui';
import { Users, Clock, MapPin, Target, Rocket, Heart } from 'lucide-react';

import { ShareDialog } from '@/components/share-dialog';
import { FavoriteButton } from '@/components/favorite-button';
import { CampaignDaysLeft } from '@/components/campaign/days-left';
import { CampaignProgress } from './progress';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { TreasuryBalanceCompact } from './treasury-balance';
import { WithdrawalDialog } from './withdrawal-dialog';
import { useAuth } from '@/contexts';
import { useCampaignRounds } from '@/hooks/use-campaign-rounds';

export function CampaignCardFull({ campaign }: { campaign: DbCampaign }) {
  const { address } = useAuth();
  const { contributorCount, contributorPendingCount } =
    useCampaignStatsFromInstance({
      campaign,
    });
  const isOwner = campaign.creatorAddress === address;
  const {
    hasRounds,
    listingSummary: roundsListingSummary,
    title: roundsTitle,
  } = useCampaignRounds({ campaign });

  return (
    <Card className="sticky top-8">
      <CardContent className="space-y-6 p-6">
        <CampaignProgress campaign={campaign} />

        {campaign.treasuryAddress && (
          <TreasuryBalanceCompact treasuryAddress={campaign.treasuryAddress} />
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span
                className="text-2xl font-bold"
                title={`Pending Contributors: ${contributorPendingCount}`}
              >
                {contributorCount}
              </span>
            </div>
            <p className="text-sm text-gray-600">contributors</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">
                <CampaignDaysLeft campaign={campaign} />
              </span>
            </div>
            <p className="text-sm text-gray-600">days left</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Link href={`/campaigns/${campaign.slug}/donation`}>
            <Button className="h-12 w-full text-lg" size="lg">
              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-white" />
                Support this campaign
              </span>
            </Button>
          </Link>
          {isOwner && <WithdrawalDialog campaign={campaign} />}
        </div>

        <div className="flex justify-center gap-2">
          <FavoriteButton campaignId={campaign.id} />
          <ShareDialog campaign={campaign} />
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="h-5 w-5" />
            <span>{campaign.location || 'Location not specified'}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <Target className="h-5 w-5" />
            <span>
              Campaign will be funded on{' '}
              {new Date(campaign.endTime).toLocaleDateString()}
            </span>
          </div>
          {hasRounds && (
            <>
              <div
                className="flex items-center gap-3 text-gray-600"
                title={roundsTitle}
              >
                <Rocket className="h-5 w-5" />

                {roundsListingSummary}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
