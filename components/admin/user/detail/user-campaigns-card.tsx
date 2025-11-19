'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { FormattedDate } from '@/components/formatted-date';
import { getStatusVariant, getStatusLabel } from '@/lib/utils/campaign-status';
import type { UserCampaign } from '@/lib/api/types';

export interface UserCampaignsCardProps {
  campaigns: UserCampaign[];
  className?: string;
  title?: string;
}

export function UserCampaignsCard({
  campaigns,
  className,
  title = 'Campaigns',
}: UserCampaignsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-sm text-muted-foreground">No campaigns</div>
        ) : (
          <div className="divide-y">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-start justify-between py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Link
                      href={`/campaigns/${campaign.slug}`}
                      target="_blank"
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {campaign.title}
                    </Link>
                    <Badge
                      variant={getStatusVariant(campaign.status)}
                      className="text-xs"
                    >
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created:{' '}
                    <FormattedDate date={new Date(campaign.createdAt)} />
                  </div>
                  {campaign.startTime && campaign.endTime && (
                    <div className="text-xs text-muted-foreground">
                      Duration:{' '}
                      <FormattedDate date={new Date(campaign.startTime)} /> -{' '}
                      <FormattedDate date={new Date(campaign.endTime)} />
                    </div>
                  )}
                </div>
                <div className="ml-4 shrink-0">
                  <Link
                    href={`/campaigns/${campaign.slug}`}
                    target="_blank"
                    className="text-xs text-primary hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
