'use client';

import { type ReactNode, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Users, Wallet, Target } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PageLayout } from '@/components/page/layout';
import { formatUSD } from '@/lib/format-usd';
import { roundHasEnded, buildRoundResultsView } from '@/lib/round-results';
import { usePublicRoundResults } from '@/lib/hooks/usePublicRoundResults';
import { trackEvent } from '@/lib/analytics';

export function PublicRoundResultsList() {
  const { data, isLoading, isError } = usePublicRoundResults();

  const completedRounds = useMemo(() => {
    return (data ?? [])
      .filter((round) => roundHasEnded(round))
      .sort(
        (a, b) =>
          new Date(b.endTime).getTime() - new Date(a.endTime).getTime(),
      );
  }, [data]);

  useEffect(() => {
    trackEvent('funnel_homepage_view', {
      source: 'round_results_list',
      path: '/rounds',
    });
  }, []);

  return (
    <PageLayout title="Funding Rounds">
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-muted-foreground sm:text-base">
          Explore completed rounds and review final distribution details.
        </p>

        {isLoading && (
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading completed round results...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Unable to load round results right now.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && completedRounds.length === 0 && (
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No completed rounds available yet.
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {completedRounds.map((round) => {
            const roundView = buildRoundResultsView(round);
            const logoUrl = round.media?.[0]?.url;

            return (
              <Card key={round.id} className="bg-card">
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {typeof logoUrl === 'string' && logoUrl.length > 0 ? (
                          <Image
                            src={logoUrl}
                            alt={round.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                            R
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-xl">
                          Round Sponsor - {round.title}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Round Period:{' '}
                          {new Date(round.startTime).toLocaleDateString()} -{' '}
                          {new Date(round.endTime).toLocaleDateString()} |{' '}
                          {roundView.campaignsCount} Campaigns
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Ended</Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/rounds/${round.id}`}
                          className="flex items-center gap-2"
                          onClick={() =>
                            trackEvent('funnel_cta_click', {
                              source: 'round_results_list',
                              path: `/rounds/${round.id}`,
                            })
                          }
                        >
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {round.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <RoundStat
                      icon={<Wallet className="h-4 w-4" />}
                      label="Matched Pool"
                      value={formatUSD(round.matchingPool)}
                    />
                    <RoundStat
                      icon={<Target className="h-4 w-4" />}
                      label="Total Donations"
                      value={formatUSD(roundView.totalDonations)}
                    />
                    <RoundStat
                      icon={<Users className="h-4 w-4" />}
                      label="Contributors"
                      value={roundView.contributorsCount.toLocaleString()}
                    />
                    <RoundStat
                      icon={<Calendar className="h-4 w-4" />}
                      label="Campaigns"
                      value={roundView.campaignsCount.toLocaleString()}
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Share by Category
                    </h3>
                    <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-center">
                      <SimplePieChart categories={roundView.categories} />
                      <div className="grid gap-2 md:grid-cols-2">
                        {roundView.categories.map((category) => (
                          <div
                            key={`${round.id}-${category.category}`}
                            className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"
                          >
                            {category.category} - {category.campaignCount}{' '}
                            campaigns ({category.percentage.toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}

const PIE_COLORS = [
  'hsl(210 100% 45%)',
  'hsl(150 65% 40%)',
  'hsl(25 95% 50%)',
  'hsl(270 60% 50%)',
  'hsl(180 50% 45%)',
  'hsl(350 65% 52%)',
];

function SimplePieChart({
  categories,
}: {
  categories: Array<{ category: string; campaignCount: number; percentage: number }>;
}) {
  const pieBackground = useMemo(() => {
    if (categories.length === 0) {
      return 'hsl(var(--muted))';
    }

    let start = 0;
    const segments = categories.map((category, index) => {
      const end = start + category.percentage;
      const color = PIE_COLORS[index % PIE_COLORS.length];
      const segment = `${color} ${start}% ${end}%`;
      start = end;
      return segment;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }, [categories]);

  return (
    <div className="flex items-center justify-center">
      <div
        className="relative h-44 w-44 rounded-full border border-border"
        style={{ background: pieBackground }}
      >
        <div className="absolute inset-8 rounded-full border border-border bg-background" />
      </div>
    </div>
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
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
