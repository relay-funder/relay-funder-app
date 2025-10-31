'use client';

import type { DbCampaign } from '@/types/campaign';
import Link from 'next/link';

import { Card, CardContent, Button } from '@/components/ui';
import { Users, Clock } from 'lucide-react';

import { CampaignDaysLeft } from '@/components/campaign/days-left';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { FormattedDate } from '@/components/formatted-date';

export function CampaignFundingBox({ campaign }: { campaign: DbCampaign }) {
  const {
    contributorCount,
    contributorPendingCount,
    amountRaised,
    amountGoal,
    progress,
  } = useCampaignStatsFromInstance({
    campaign,
  });

  // Check if the campaign has started
  const hasStarted = new Date(campaign.startTime).getTime() <= Date.now();

  return (
    <Card className="sticky top-8">
      <CardContent className="space-y-4 p-4">
        {/* Funding Progress - Match campaign card format */}
        <div className="space-y-3">
          {/* Funding Stats - Match card format */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{amountRaised}</span>
              <span className="pb-[3px] text-muted-foreground">raised</span>
            </div>
            <span className="mt-[6px] text-muted-foreground">
              of <span className="text-base font-semibold">{amountGoal}</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-quantum transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span
                className="text-xl font-bold"
                title={`Pending Contributors: ${contributorPendingCount}`}
              >
                {contributorCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">contributors</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-bold">
                <CampaignDaysLeft campaign={campaign} />
              </span>
            </div>
            <p className="text-xs text-muted-foreground">days left</p>
          </div>
        </div>

        <div className="space-y-2">
          {hasStarted ? (
            <Link href={`/campaigns/${campaign.slug}/donation`}>
              <Button
                className="h-10 w-full dark:bg-quantum dark:text-white dark:hover:bg-quantum/90"
                size="default"
              >
                Support this campaign
              </Button>
            </Link>
          ) : (
            <Button className="h-10 w-full" size="default" disabled>
              Starts <FormattedDate date={campaign.startTime} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
