'use client';

import { useActiveRound } from '@/lib/hooks/useRounds';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatUSD } from '@/lib/format-usd';
import { useMemo } from 'react';

export function RoundSpotlight() {
  const { data: round, isLoading, error } = useActiveRound();

  // Calculate days left for countdown
  const daysLeft = useMemo(() => {
    if (!round?.endTime) {
      return 0;
    }
    const now = new Date();
    const endDate = new Date(round.endTime);
    return Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }, [round?.endTime]);

  // Don't render anything if there's no active round or if loading/error
  if (isLoading || error || !round) {
    return null;
  }

  const logoUrl = round.media?.[0]?.url;
  const campaignCount = round._count?.roundCampaigns || 0;

  return (
    <div className="mb-8">
      <Card className="border border-border bg-card">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Active Matching Round
            </h2>
          </div>

          <div className="flex flex-col items-start gap-6 md:flex-row">
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
                  <span className="font-medium">Match Pool Available:</span>
                  <span className="font-bold text-green-600">
                    {formatUSD(round.matchingPool)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {campaignCount} Participating Campaigns
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-bold text-orange-600">
                    {daysLeft} days left
                  </span>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-border bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>💡 Match Funding:</strong> Your donation gets
                  amplified! The more people who donate to a campaign, the more
                  matching funds it receives from this{' '}
                  {formatUSD(round.matchingPool)} pool until funds run out.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
