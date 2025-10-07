'use client';

import type { DbCampaign } from '@/types/campaign';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from '@/components/ui';
import { TrendingUp, HelpCircle } from 'lucide-react';

import { useCampaignRounds } from '@/hooks/use-campaign-rounds';
import { useCampaignMatching } from '@/lib/hooks/useCampaignMatching';
import { HowMatchingWorksDialog } from './how-matching-works-dialog';
import { useMemo } from 'react';

export function CampaignMatchingFundsHighlight({
  campaign,
  variant = 'default',
}: {
  campaign: DbCampaign;
  variant?: 'default' | 'compact';
}) {
  const { hasRounds, activeRounds, futureRounds } = useCampaignRounds({
    campaign,
  });

  const validRounds = [...activeRounds, ...futureRounds];
  const latestRound = validRounds[0];

  const status = useMemo(() => {
    if (!latestRound) return 'Upcoming';
    const now = new Date();
    if (
      now >= new Date(latestRound.startTime) &&
      now <= new Date(latestRound.endTime)
    ) {
      return 'Active';
    }
    if (now > new Date(latestRound.endTime)) {
      return 'Ended';
    }
    return 'Upcoming';
  }, [latestRound]);

  const isUpcomingRound = status === 'Upcoming';
  const hasMatchingPool = latestRound?.matchingPool > 0;

  const {
    data: estimatedMatch,
    isPending,
    isError,
  } = useCampaignMatching({
    roundId: latestRound?.id,
    campaignId: campaign.id,
    enabled: hasMatchingPool && !isUpcomingRound,
  });

  // Only show if campaign has active or future rounds (matching funding)
  if (!hasRounds || (activeRounds.length === 0 && futureRounds.length === 0)) {
    return null;
  }

  const formattedMatchingPool = latestRound.matchingPool.toLocaleString();

  const estimateValue = estimatedMatch ? parseFloat(estimatedMatch) : 0;
  const formattedEstimate =
    estimateValue === Math.floor(estimateValue)
      ? estimateValue.toLocaleString()
      : estimateValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  if (variant === 'compact') {
    return (
      <Card className="border-primary/20 bg-card">
        <CardContent className="space-y-2 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Matching Funds</h3>
                <p className="text-xs text-muted-foreground">Live estimate</p>
              </div>
            </div>
            <HowMatchingWorksDialog>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="sr-only">How matching works</span>
              </Button>
            </HowMatchingWorksDialog>
          </div>

          <div className="flex items-baseline justify-between">
            {isPending && hasMatchingPool && !isUpcomingRound ? (
              <div className="flex animate-pulse items-baseline gap-2">
                <div className="h-7 w-20 rounded bg-muted"></div>
              </div>
            ) : isUpcomingRound ? (
              <span className="text-sm font-semibold text-muted-foreground">
                Available when round starts
              </span>
            ) : isError || !estimatedMatch ? (
              <span className="text-sm font-semibold text-muted-foreground">
                TBD
              </span>
            ) : (
              <span className="text-2xl font-bold">${formattedEstimate}</span>
            )}
            <span className="text-xs text-muted-foreground">
              from ${formattedMatchingPool} pool
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Matching Funds</h3>
              <p className="text-xs text-muted-foreground">Live estimate</p>
            </div>
          </div>
          <HowMatchingWorksDialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">How matching works</span>
            </Button>
          </HowMatchingWorksDialog>
        </div>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">Current estimate</p>
          {isPending && hasMatchingPool && !isUpcomingRound ? (
            <div className="flex animate-pulse items-baseline gap-2">
              <div className="h-8 w-24 rounded bg-muted"></div>
            </div>
          ) : isUpcomingRound ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-muted-foreground">
                Available when round starts
              </span>
            </div>
          ) : isError || !estimatedMatch ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-muted-foreground">
                TBD
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${formattedEstimate}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            From ${formattedMatchingPool} matching pool
          </p>
        </div>

        <div className="border-t pt-3">
          <p className="mb-2 text-xs text-muted-foreground">Supported by</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={latestRound.media?.[0]?.url}
                alt={latestRound.title}
              />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {latestRound.title.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">{latestRound.title}</span>
          </div>
        </div>

        <div className="space-y-1 border-t pt-3">
          <p className="text-xs text-muted-foreground">
            More donors = bigger match. Your contribution counts regardless of
            amount.
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            Using Quadratic Funding
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
