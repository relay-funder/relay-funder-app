'use client';

import { useActiveRound, useUpcomingRound } from '@/lib/hooks/useRounds';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Calendar, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatUSD } from '@/lib/format-usd';
import { useMemo } from 'react';

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

  // Determine the selected round first (active takes priority)
  const selectedRound = activeRound ?? upcomingRound;
  const round = selectedRound;
  const isLoading =
    selectedRound === activeRound ? activeLoading : upcomingLoading;
  const error = selectedRound === activeRound ? activeError : upcomingError;
  const isUpcoming = selectedRound === upcomingRound;

  // Calculate days left for countdown (only for active rounds)
  const daysLeft = useMemo(() => {
    if (!round?.endTime || isUpcoming) {
      return 0;
    }
    const now = new Date();
    const endDate = new Date(round.endTime);
    return Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [round?.endTime, isUpcoming]);

  // Calculate days until start (for upcoming rounds)
  const daysUntilStart = useMemo(() => {
    if (!round?.startTime || !isUpcoming) {
      return 0;
    }
    const now = new Date();
    const startDate = new Date(round.startTime);
    return Math.max(
      0,
      Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [round?.startTime, isUpcoming]);

  // Check if applications are still open
  const applicationsOpen = useMemo(() => {
    if (!round?.applicationEndTime) {
      return false;
    }
    return new Date(round.applicationEndTime) > new Date();
  }, [round?.applicationEndTime]);

  // Format application end date
  const applicationEndDate = useMemo(() => {
    if (!round?.applicationEndTime) {
      return '';
    }
    return new Date(round.applicationEndTime).toLocaleDateString();
  }, [round?.applicationEndTime]);

  // Don't render anything if there's no round or if loading/error
  if (isLoading || error || !round) {
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
              ) : (
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {isUpcoming ? 'Upcoming Matching Round' : 'Active Matching Round'}
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/rounds/${round.id}`}
              className="flex items-center gap-2"
            >
              View Round
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
