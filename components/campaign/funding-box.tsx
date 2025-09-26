'use client';

import type { DbCampaign } from '@/types/campaign';
import Link from 'next/link';

import { Card, CardContent, Button } from '@/components/ui';
import { Users, Clock, Heart } from 'lucide-react';

import { CampaignDaysLeft } from '@/components/campaign/days-left';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { WithdrawalDialog } from './withdrawal-dialog';
import { useAuth } from '@/contexts';

export function CampaignFundingBox({ campaign }: { campaign: DbCampaign }) {
  const { address } = useAuth();
  const {
    contributorCount,
    contributorPendingCount,
    amountRaised,
    amountGoal,
    progress,
  } = useCampaignStatsFromInstance({
    campaign,
  });
  const isOwner = campaign.creatorAddress === address;

  return (
    <Card className="sticky top-8">
      <CardContent className="space-y-4 p-4">
        {/* Funding Progress - Match campaign card format */}
        <div className="space-y-3">
          {/* Funding Stats - Match card format */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{amountRaised}</span>
              <span className="pb-[3px] text-gray-500">raised</span>
            </div>
            <span className="mt-[6px] text-gray-500">
              of <span className="text-base font-semibold">{amountGoal}</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span
                className="text-xl font-bold"
                title={`Pending Contributors: ${contributorPendingCount}`}
              >
                {contributorCount}
              </span>
            </div>
            <p className="text-xs text-gray-600">contributors</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xl font-bold">
                <CampaignDaysLeft campaign={campaign} />
              </span>
            </div>
            <p className="text-xs text-gray-600">days left</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link href={`/campaigns/${campaign.slug}/donation`}>
            <Button className="h-10 w-full" size="default">
              <Heart className="h-5 w-5 text-white" />
              Support this campaign
            </Button>
          </Link>
          {isOwner && <WithdrawalDialog campaign={campaign} />}
        </div>
      </CardContent>
    </Card>
  );
}
