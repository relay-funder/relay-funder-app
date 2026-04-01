'use client';

import { type ReactNode, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Target,
  Users,
  Wallet,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { PageLayout } from '@/components/page/layout';
import { formatUSD } from '@/lib/format-usd';
import { buildRoundResultsView, roundHasEnded } from '@/lib/round-results';
import { usePublicRoundResult } from '@/lib/hooks/usePublicRoundResults';
import { trackEvent } from '@/lib/analytics';

export function PublicRoundResultsDetail({ roundId }: { roundId: number }) {
  const { data: round, isLoading, isError } = usePublicRoundResult(roundId);
  const router = useRouter();

  const roundView = useMemo(() => {
    if (!round) {
      return null;
    }

    return buildRoundResultsView(round);
  }, [round]);

  useEffect(() => {
    if (!isLoading && !isError && round === null) {
      router.replace('/rounds');
    }
  }, [isLoading, isError, round, router]);

  useEffect(() => {
    if (!isLoading && !isError && round && !roundHasEnded(round)) {
      router.replace('/rounds');
    }
  }, [isLoading, isError, round, router]);

  useEffect(() => {
    if (!round) {
      return;
    }

    trackEvent('funnel_homepage_view', {
      source: 'round_results_detail',
      path: `/rounds/${round.id}`,
    });
  }, [round]);

  return (
    <PageLayout title="Round Results">
      <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href="/rounds"
              className="flex items-center gap-2"
              onClick={() =>
                trackEvent('funnel_cta_click', {
                  source: 'round_results_detail',
                  path: '/rounds',
                })
              }
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Rounds
            </Link>
          </Button>
        </div>

        {isLoading && (
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading round results...
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Unable to load this round.
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && (!round || !roundView) && (
          <Card className="bg-card">
            <CardContent className="p-6 text-sm text-muted-foreground">
              This round does not have published results yet.
            </CardContent>
          </Card>
        )}

        {round && roundView && roundHasEnded(round) && (
          <>
            <RoundHeaderSection
              title={round.title}
              description={round.description}
              logoUrl={round.media?.[0]?.url}
              startTime={round.startTime}
              endTime={round.endTime}
              sponsor={roundView.sponsor}
              matchingPool={round.matchingPool}
              totalDonations={roundView.totalDonations}
              contributorsCount={roundView.contributorsCount}
              campaignsCount={roundView.campaignsCount}
              categories={roundView.categories}
            />

            <RoundPartnersSection partners={roundView.partners} />

            <RoundAmountsSection categories={roundView.categories} />

            <RoundCampaignTableSection
              campaigns={roundView.campaigns}
              partners={roundView.partners}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}

function formatCategoryLabel(category: string): string {
  return category
    .split('-')
    .map((word) =>
      word.length > 0 ? `${word[0].toUpperCase()}${word.slice(1)}` : word,
    )
    .join(' ');
}

function RoundHeaderSection({
  title,
  description,
  logoUrl,
  startTime,
  endTime,
  sponsor,
  matchingPool,
  totalDonations,
  contributorsCount,
  campaignsCount,
  categories,
}: {
  title: string;
  description: string;
  logoUrl: string | undefined;
  startTime: string;
  endTime: string;
  sponsor: {
    name: string;
    logo: string;
    description: string;
    website: string;
  };
  matchingPool: number;
  totalDonations: number;
  contributorsCount: number;
  campaignsCount: number;
  categories: Array<{
    category: string;
    campaignCount: number;
    percentage: number;
    donations: number;
    matchFunding: number;
    totalRaised: number;
    donationCount: number;
  }>;
}) {
  const hasSponsorWebsite =
    typeof sponsor.website === 'string' && sponsor.website.length > 0;
  const sponsorDescription = sponsor.description.trim();
  const roundDescription = description.trim();
  const headerDescription =
    sponsorDescription.length > 0 ? sponsorDescription : roundDescription;
  const hasSponsorLogo =
    typeof sponsor.logo === 'string' && sponsor.logo.length > 0;
  const hasRoundLogo = typeof logoUrl === 'string' && logoUrl.length > 0;
  const roundPeriodLabel = `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleDateString()}`;

  return (
    <Card className="bg-card">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div
            className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border ${
              hasSponsorLogo ? 'bg-white' : 'bg-muted'
            }`}
          >
            {hasSponsorLogo ? (
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                fill
                className="object-contain p-2"
              />
            ) : hasRoundLogo ? (
              <Image src={logoUrl} alt={title} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                R
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Round Sponsor: {sponsor.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Round Period: {roundPeriodLabel}
            </p>
            {hasSponsorWebsite && (
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                onClick={() =>
                  trackEvent('funnel_cta_click', {
                    source: 'round_sponsor_link',
                    path: sponsor.website,
                  })
                }
              >
                Visit sponsor
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <p className="text-sm text-muted-foreground">{headerDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <RoundStat
            icon={<Wallet className="h-4 w-4" />}
            label="Matched Pool"
            value={formatUSD(matchingPool)}
          />
          <RoundStat
            icon={<Target className="h-4 w-4" />}
            label="Total Donations"
            value={formatUSD(totalDonations)}
          />
          <RoundStat
            icon={<Users className="h-4 w-4" />}
            label="Contributors"
            value={contributorsCount.toLocaleString()}
          />
          <RoundStat
            icon={<Calendar className="h-4 w-4" />}
            label="Campaigns"
            value={campaignsCount.toLocaleString()}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            # of Campaigns by Category
          </h3>
          <div className="grid gap-4 lg:grid-cols-[240px_1fr] lg:items-center">
            <SimplePieChart categories={categories} />
            <div className="grid gap-3 md:grid-cols-2">
              {categories.map((category, index) => {
                const categoryColor = PIE_COLORS[index % PIE_COLORS.length];
                return (
                  <div
                    key={category.category}
                    className="rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <p className="text-sm font-medium text-foreground">
                        {formatCategoryLabel(category.category)}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border px-2 py-0.5">
                        {category.campaignCount}{' '}
                        {category.campaignCount === 1
                          ? 'Campaign'
                          : 'Campaigns'}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5">
                        {category.percentage.toFixed(1)}% Share
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoundPartnersSection({
  partners,
}: {
  partners: Array<{
    id: string;
    name: string;
    logo: string;
    description: string;
    website: string;
    campaignCount: number;
    donations: number;
    matchFunding: number;
    totalRaised: number;
  }>;
}) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Round Partners</CardTitle>
      </CardHeader>
      <CardContent>
        {partners.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No organization bindings are configured for this round yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {partners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent('funnel_cta_click', {
                    source: 'round_partner_card',
                    path: partner.website,
                  })
                }
                className="rounded-xl border border-border bg-muted/20 p-5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {partner.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="text-lg font-semibold leading-tight text-foreground">
                        {partner.name}
                      </p>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {partner.description}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {partner.campaignCount}{' '}
                  {partner.campaignCount === 1 ? 'campaign' : 'campaigns'} in
                  this round
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-md border border-border/70 bg-background/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Donations
                    </p>
                    <p className="font-medium text-foreground">
                      {formatUSD(partner.donations)}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Match
                    </p>
                    <p className="font-medium text-foreground">
                      {formatUSD(partner.matchFunding)}
                    </p>
                  </div>
                  <div className="rounded-md border border-primary/40 bg-primary/10 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Total
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatUSD(partner.totalRaised)}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoundAmountsSection({
  categories,
}: {
  categories: Array<{
    category: string;
    donations: number;
    matchFunding: number;
    totalRaised: number;
    donationCount: number;
  }>;
}) {
  const categoriesByRaised = useMemo(
    () =>
      [...categories].sort(
        (left, right) => right.totalRaised - left.totalRaised,
      ),
    [categories],
  );
  const largestTotal = categoriesByRaised[0]?.totalRaised ?? 0;
  const highestContributionCount = categoriesByRaised.reduce(
    (maximum, category) =>
      Math.max(
        maximum,
        Number.isFinite(category.donationCount) ? category.donationCount : 0,
      ),
    0,
  );

  const truncateCategoryName = (name: string): string => {
    const formattedName = formatCategoryLabel(name);
    if (formattedName.length <= 18) {
      return formattedName;
    }

    return `${formattedName.slice(0, 18)}...`;
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Amounts Raised by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Each category includes two bars: total raised (donations + match) and
          contribution count.
        </p>
      </CardHeader>
      <CardContent>
        {categoriesByRaised.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No campaign totals available.
          </p>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px]">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">
                  Solid bar = Total raised
                </span>
                <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">
                  Soft bar = Contributions
                </span>
              </div>
              <div className="flex h-[300px] items-end gap-3">
                {categoriesByRaised.map((category, index) => {
                  const categoryColor = PIE_COLORS[index % PIE_COLORS.length];
                  const totalPercentage =
                    largestTotal > 0
                      ? (category.totalRaised / largestTotal) * 100
                      : 0;
                  const contributionPercentage =
                    highestContributionCount > 0
                      ? (category.donationCount / highestContributionCount) *
                        100
                      : 0;

                  return (
                    <div
                      key={category.category}
                      className="flex min-w-[130px] flex-1 flex-col justify-end gap-2"
                    >
                      <div className="flex h-[180px] items-end gap-2 rounded-lg border border-border/70 bg-muted/20 p-2">
                        <div className="flex h-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-md"
                            style={{
                              height: `${Math.max(6, totalPercentage)}%`,
                              backgroundColor: categoryColor,
                            }}
                            title={`${formatCategoryLabel(category.category)} total raised: ${formatUSD(category.totalRaised)} (Donations: ${formatUSD(category.donations)}, Match: ${formatUSD(category.matchFunding)})`}
                          />
                        </div>
                        <div className="flex h-full flex-1 items-end">
                          <div
                            className="w-full rounded-t-md border border-border/60"
                            style={{
                              height: `${Math.max(6, contributionPercentage)}%`,
                              backgroundColor: categoryColor,
                              opacity: 0.45,
                            }}
                            title={`${formatCategoryLabel(category.category)} contributions: ${category.donationCount.toLocaleString()}`}
                          />
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/20 p-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-border"
                            style={{ backgroundColor: categoryColor }}
                          />
                          <p
                            className="text-sm font-semibold text-foreground"
                            title={formatCategoryLabel(category.category)}
                          >
                            {truncateCategoryName(category.category)}
                          </p>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">
                              Total Raised
                            </p>
                            <p className="font-semibold text-foreground">
                              {formatUSD(category.totalRaised)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Contributions
                            </p>
                            <p className="font-semibold text-foreground">
                              {category.donationCount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoundCampaignTableSection({
  campaigns,
  partners,
}: {
  campaigns: Array<{
    id: number;
    name: string;
    imageUrl: string | null;
    country: string;
    partnerId: string;
    donations: number;
    contributors: number;
    contributions: number;
    matchFunding: number;
    total: number;
    share: number;
  }>;
  partners: Array<{ id: string; name: string; logo: string }>;
}) {
  const partnerLookup = useMemo(() => {
    const map = new Map<string, { name: string; logo: string }>();
    partners.forEach((partner) => {
      map.set(partner.id, {
        name: partner.name,
        logo: partner.logo,
      });
    });
    return map;
  }, [partners]);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Campaign Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="-mx-6 overflow-x-auto px-6">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Round Partner</TableHead>
                <TableHead className="text-right">Donations</TableHead>
                <TableHead className="text-right">Contributors</TableHead>
                <TableHead className="text-right">Contributions</TableHead>
                <TableHead className="text-right">Matching Amount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign, index) => (
                <TableRow key={campaign.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted">
                        {campaign.imageUrl ? (
                          <Image
                            src={campaign.imageUrl}
                            alt={campaign.name}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="line-clamp-2">{campaign.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{campaign.country}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative h-5 w-5 overflow-hidden rounded-full border border-border bg-background">
                        {partnerLookup.get(campaign.partnerId)?.logo ? (
                          <Image
                            src={
                              partnerLookup.get(campaign.partnerId)?.logo || ''
                            }
                            alt={
                              partnerLookup.get(campaign.partnerId)?.name || ''
                            }
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                            {(
                              partnerLookup.get(campaign.partnerId)?.name ??
                              'Organization'
                            )
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span>
                        {partnerLookup.get(campaign.partnerId)?.name ??
                          'Organization pending binding'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUSD(campaign.donations)}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.contributors.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.contributions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUSD(campaign.matchFunding)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatUSD(campaign.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.share.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
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
  categories: Array<{
    category: string;
    campaignCount: number;
    percentage: number;
  }>;
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
