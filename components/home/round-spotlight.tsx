'use client';

import {
  useActiveRound,
  useLatestCompletedRound,
  useUpcomingRound,
} from '@/lib/hooks/useRounds';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Calendar, ArrowRight, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatUSD } from '@/lib/format-usd';
import { useMemo } from 'react';
import { trackEvent } from '@/lib/analytics';

export function RoundSpotlight() {
  const {
    data: activeRound,
    isLoading: activeLoading,
    error: activeError,
  } = useActiveRound();
  const {
    data: upcomingRound,
    isLoading: upcomingLoading,
    error: upcomingError,
  } = useUpcomingRound();
  const {
    data: latestCompletedRound,
    isLoading: latestCompletedLoading,
    error: latestCompletedError,
  } = useLatestCompletedRound();

  // Determine the selected round:
  // 1) Active round
  // 2) Latest completed round (results fallback)
  // 3) Upcoming round
  const selectedRound = activeRound ?? latestCompletedRound ?? upcomingRound;
  const round = selectedRound;
  const isLoading =
    activeLoading ||
    (!activeRound && latestCompletedLoading) ||
    (!activeRound && !latestCompletedRound && upcomingLoading);
  const error =
    activeError ??
    (!activeRound ? latestCompletedError : undefined) ??
    (!activeRound && !latestCompletedRound ? upcomingError : undefined);
  const roundState = activeRound
    ? 'active'
    : latestCompletedRound
      ? 'completed'
      : upcomingRound
        ? 'upcoming'
        : null;
  const isUpcoming = roundState === 'upcoming';
  const isCompleted = roundState === 'completed';

  // Calculate days left for countdown (only for active rounds)
  const daysLeft = useMemo(() => {
    if (!round?.endTime || roundState !== 'active') {
      return 0;
    }
    const now = new Date();
    const endDate = new Date(round.endTime);
    return Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [round?.endTime, roundState]);

  // Calculate days until start (for upcoming rounds)
  const daysUntilStart = useMemo(() => {
    if (!round?.startTime || roundState !== 'upcoming') {
      return 0;
    }
    const now = new Date();
    const startDate = new Date(round.startTime);
    return Math.max(
      0,
      Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [round?.startTime, roundState]);

  // Check if applications are still open
  const applicationsOpen = useMemo(() => {
    if (!round?.applicationEndTime || roundState !== 'upcoming') {
      return false;
    }
    return new Date(round.applicationEndTime) > new Date();
  }, [round?.applicationEndTime, roundState]);

  // Format application end date
  const applicationEndDate = useMemo(() => {
    if (!round?.applicationEndTime || roundState !== 'upcoming') {
      return '';
    }
    return new Date(round.applicationEndTime).toLocaleDateString();
  }, [round?.applicationEndTime, roundState]);

  const roundEndDate = useMemo(() => {
    if (!round?.endTime || roundState !== 'completed') {
      return '';
    }
    return new Date(round.endTime).toLocaleDateString();
  }, [round?.endTime, roundState]);

  // Don't render anything if there is no usable round data
  if (!round && (isLoading || error)) {
    return null;
  }

  if (!round) {
    return null;
  }

  const logoUrl = round.media?.[0]?.url;
  const campaignCount = round._count?.roundCampaigns || 0;

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col items-center justify-between xxs:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {isUpcoming ? (
                <Calendar className="h-4 w-4 text-muted-foreground" />
              ) : isCompleted ? (
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {isUpcoming
                ? 'Upcoming Matching Round'
                : isCompleted
                  ? 'Latest Round Results'
                  : 'Active Matching Round'}
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/rounds/${round.id}`}
              className="flex items-center gap-2"
              onClick={() =>
                trackEvent('funnel_cta_click', {
                  source: 'round_spotlight',
                  path: `/rounds/${round.id}`,
                })
              }
            >
              {isCompleted ? 'View Results' : 'View Round'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center gap-6 xxs:items-start md:flex-row">
          {/* Round Logo */}
          {logoUrl && (
            <div className="flex-shrink-0">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-card md:h-28 md:w-28">
                <Image
                  src={logoUrl}
                  alt={`${round.title} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Round Details */}
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
              {round.title}
            </h1>

            <p className="mb-4 line-clamp-3 text-muted-foreground">
              {round.description}
            </p>

            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium">Match Pool:</span>
                <span className="font-bold text-green-600">
                  {formatUSD(round.matchingPool)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {campaignCount} {isUpcoming ? 'Approved' : 'Participating'}{' '}
                  Campaigns
                </span>
              </div>
              <div className="flex items-center gap-1">
                {isUpcoming ? (
                  <>
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-bold text-blue-600">
                      Starts in {daysUntilStart} days
                    </span>
                  </>
                ) : isCompleted ? (
                  <>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-muted-foreground">
                      Ended on {roundEndDate}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-bold text-orange-600">
                      {daysLeft} days left
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-border bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                {isUpcoming ? (
                  applicationsOpen ? (
                    <>
                      <strong>📅 Coming Soon:</strong> This round will feature{' '}
                      {formatUSD(round.matchingPool)} in matching funds.
                      Applications are open until {applicationEndDate}.
                    </>
                  ) : (
                    <>
                      <strong>📅 Coming Soon:</strong> This round will feature{' '}
                      {formatUSD(round.matchingPool)} in matching funds for
                      approved campaigns. Applications are now closed.
                    </>
                  )
                ) : isCompleted ? (
                  <>
                    <strong>Round Results:</strong> This round has ended. View
                    detailed campaign-level outcomes and funding distribution.
                  </>
                ) : (
                  <>
                    <strong>💡 Match Funding:</strong> Your donation gets
                    amplified! The more people who donate to a campaign, the
                    more matching funds it receives from this{' '}
                    {formatUSD(round.matchingPool)} pool until funds run out.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
