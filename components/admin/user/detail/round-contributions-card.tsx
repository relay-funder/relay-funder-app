'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { RoundContributionLite } from '@/lib/api/types';

export interface RoundContributionsCardProps {
  contributions: RoundContributionLite[];
  className?: string;
  title?: string;
}

export function RoundContributionsCard({
  contributions,
  className,
  title = 'Round Contributions',
}: RoundContributionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {contributions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No round contributions
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {contributions.map((rc) => (
              <div key={rc.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {rc.payment?.amount} {rc.payment?.token}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      rc.createdAt as unknown as string,
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Round:{' '}
                  {rc.roundCampaign?.Round ? (
                    <span className="font-medium">
                      {rc.roundCampaign.Round.title}
                    </span>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="mt-1 text-xs">
                  Campaign:{' '}
                  {rc.roundCampaign?.Campaign ? (
                    <Link
                      href={`/campaigns/${rc.roundCampaign.Campaign.slug}`}
                      className="text-primary hover:underline"
                    >
                      {rc.roundCampaign.Campaign.title}
                    </Link>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RoundContributionsCard;
