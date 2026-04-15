'use client';

import { type ReactNode, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Sparkles, Target, Users, Wallet } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { PageLayout } from '@/components/page/layout';
import { ACTIVE_ROUNDS_PATH, ROUND_RESULTS_PATH } from '@/lib/constant';
import { formatUSD } from '@/lib/format-usd';
import { trackEvent } from '@/lib/analytics';
import {
  useActiveRound,
  useRound,
  useUpcomingRound,
} from '@/lib/hooks/useRounds';

export function PublicCurrentRoundPage() {
  const {
    data: activeRound,
    isLoading: isActiveRoundLoading,
    error: activeRoundError,
  } = useActiveRound();
  const {
    data: upcomingRound,
    isLoading: isUpcomingRoundLoading,
    error: upcomingRoundError,
  } = useUpcomingRound();

  const currentRound = activeRound ?? upcomingRound;
  const currentRoundState = activeRound
    ? 'active'
    : upcomingRound
      ? 'upcoming'
      : null;
  const currentRoundId = currentRound?.id ?? 0;
  const {
    data: currentRoundDetail,
    isLoading: isCurrentRoundDetailLoading,
    error: currentRoundDetailError,
  } = useRound(currentRoundId, true);

  useEffect(() => {
    trackEvent('funnel_homepage_view', {
      source: 'public_current_round',
      path: ACTIVE_ROUNDS_PATH,
    });
  }, []);

  const timingSummary = useMemo(() => {
    if (!currentRound || !currentRoundState) {
      return '';
    }

    if (currentRoundState === 'active') {
      return `Ends ${new Date(currentRound.endTime).toLocaleString()}`;
    }

    return `Starts ${new Date(currentRound.startTime).toLocaleString()}`;
  }, [currentRound, currentRoundState]);

  const applicationsSummary = useMemo(() => {
    if (!currentRound || currentRoundState !== 'upcoming') {
      return '';
    }

    const applicationEndDate = new Date(
      currentRound.applicationEndTime,
    ).toLocaleString();

    if (new Date(currentRound.applicationEndTime) > new Date()) {
      return `Applications close ${applicationEndDate}`;
    }

    return `Applications closed ${applicationEndDate}`;
  }, [currentRound, currentRoundState]);

  const publicCampaigns = useMemo(() => {
    const roundCampaigns = currentRoundDetail?.round?.roundCampaigns ?? [];
    return roundCampaigns.flatMap((roundCampaign) =>
      roundCampaign.campaign ? [roundCampaign.campaign] : [],
    );
  }, [currentRoundDetail]);

  if (isActiveRoundLoading || (!activeRound && isUpcomingRoundLoading)) {
    return (
      <PageLayout title="Active Rounds">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading the current public round...
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (activeRoundError || (!activeRound && upcomingRoundError)) {
    return (
      <PageLayout title="Active Rounds">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Unable to load the current public round right now.
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!currentRound || !currentRoundState) {
    return (
      <PageLayout title="Active Rounds">
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={ROUND_RESULTS_PATH}>Round Results</Link>
            </Button>
          </div>

          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              There is no active or upcoming public round right now.
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const logoUrl = currentRound.media?.[0]?.url;
  const campaignCount =
    currentRoundDetail?.round?.roundCampaigns?.length ??
    currentRound._count?.roundCampaigns ??
    0;
  const isActiveRound = currentRoundState === 'active';
  const canJumpToCampaigns = publicCampaigns.length > 0;

  return (
    <PageLayout title="Active Rounds">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link
              href={ROUND_RESULTS_PATH}
              onClick={() =>
                trackEvent('funnel_cta_click', {
                  source: 'public_current_round',
                  path: ROUND_RESULTS_PATH,
                })
              }
            >
              Round Results
            </Link>
          </Button>
        </div>

        <p className="mb-6 text-sm text-muted-foreground sm:text-base">
          {isActiveRound
            ? 'The currently active public round is shown here. Upcoming rounds only appear when nothing is live yet.'
            : 'There is no live public round right now, so the next upcoming round is shown here.'}
        </p>

        <Card className="bg-card">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={currentRound.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                      R
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isActiveRound ? 'default' : 'outline'}>
                      {isActiveRound ? 'Active Round' : 'Upcoming Round'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {timingSummary}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">
                    {currentRound.title}
                  </CardTitle>
                </div>
              </div>

              {canJumpToCampaigns ? (
                <Button asChild>
                  <Link
                    href="#round-campaigns"
                    className="flex items-center gap-2"
                    onClick={() =>
                      trackEvent('funnel_cta_click', {
                        source: 'public_current_round',
                        path: '#round-campaigns',
                      })
                    }
                  >
                    View Round Campaigns
                  </Link>
                </Button>
              ) : (
                <Button disabled>View Round Campaigns</Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground sm:text-base">
              {currentRound.description}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <RoundStat
                icon={<Wallet className="h-4 w-4" />}
                label="Matching Pool"
                value={formatUSD(currentRound.matchingPool)}
              />
              <RoundStat
                icon={<Users className="h-4 w-4" />}
                label={
                  isActiveRound
                    ? 'Participating Campaigns'
                    : 'Approved Campaigns'
                }
                value={campaignCount.toLocaleString()}
              />
              <RoundStat
                icon={
                  isActiveRound ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )
                }
                label={isActiveRound ? 'Round Timing' : 'Round Start'}
                value={timingSummary}
              />
              <RoundStat
                icon={<Target className="h-4 w-4" />}
                label={isActiveRound ? 'Support Window' : 'Applications'}
                value={
                  isActiveRound
                    ? `Open until ${new Date(currentRound.endTime).toLocaleString()}`
                    : applicationsSummary
                }
              />
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4" />
                {isActiveRound ? 'Round Live Now' : 'Round Coming Up'}
              </div>
              <p className="text-sm text-muted-foreground">
                {isActiveRound
                  ? `Donations made during this round can participate in the ${formatUSD(
                      currentRound.matchingPool,
                    )} matching pool.`
                  : `When this round starts, approved campaigns will compete for ${formatUSD(
                      currentRound.matchingPool,
                    )} in matching funds.`}
              </p>
            </div>
          </CardContent>
        </Card>

        <section id="round-campaigns" className="mt-8 scroll-mt-24 space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Round Campaigns
            </h2>
            <p className="text-muted-foreground">
              {campaignCount > 0
                ? `Showing ${campaignCount} public campaigns participating in this round.`
                : 'No public campaigns are visible in this round yet.'}
            </p>
          </div>

          {isCurrentRoundDetailLoading ? (
            <Card className="bg-card">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Loading participating campaigns...
              </CardContent>
            </Card>
          ) : currentRoundDetailError ? (
            <Card className="bg-card">
              <CardContent className="p-6 text-sm text-muted-foreground">
                Unable to load participating campaigns right now.
              </CardContent>
            </Card>
          ) : publicCampaigns.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publicCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  type="standard"
                />
              ))}
            </div>
          ) : (
            <Card className="bg-card">
              <CardContent className="p-6 text-sm text-muted-foreground">
                This round does not have any publicly visible campaigns yet.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

function RoundStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground sm:text-base">
        {value}
      </p>
    </div>
  );
}
