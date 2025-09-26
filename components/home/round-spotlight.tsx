'use client';

import { useActiveRound } from '@/lib/hooks/useRounds';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatUSD } from '@/lib/format-usd';

export function RoundSpotlight() {
  const { data: round, isLoading, error } = useActiveRound();

  // Don't render anything if there's no active round or if loading/error
  if (isLoading || error || !round) {
    return null;
  }

  const logoUrl = round.media?.[0]?.url;
  const campaignCount = round._count?.roundCampaigns || 0;

  return (
    <div className="mb-8">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <Sparkles className="h-4 w-4 text-gray-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Active Matching Round
            </h2>
          </div>

          <div className="flex flex-col items-start gap-6 md:flex-row">
            {/* Round Logo */}
            {logoUrl && (
              <div className="flex-shrink-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white md:h-20 md:w-20">
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
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                {round.title}
              </h3>

              <p className="mb-4 line-clamp-3 text-gray-700">
                {round.description}
              </p>

              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Matching Pool:</span>
                  <span className="font-bold text-gray-900">
                    {formatUSD(round.matchingPool)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Campaigns:</span>
                  <span className="font-bold text-gray-900">
                    {campaignCount}
                  </span>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-700">
                  <strong>💡 Quadratic Funding:</strong> Your donation gets
                  amplified! The more people who donate to a campaign, the more
                  matching funds it receives from this{' '}
                  {formatUSD(round.matchingPool)} pool.
                </p>
              </div>

              <Link href={`/rounds/${round.id}`}>
                <Button variant="default" className="bg-gray-900 text-white hover:bg-gray-800">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
