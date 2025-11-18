'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
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
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING_APPROVAL':
        return 'secondary';
      case 'DRAFT':
        return 'outline';
      case 'COMPLETED':
        return 'secondary';
      case 'DISABLED':
      case 'FAILED':
      case 'CANCELLED':
      case 'PAUSED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'ACTIVE':
        return 'Active';
      case 'DRAFT':
        return 'Draft';
      case 'COMPLETED':
        return 'Completed';
      case 'DISABLED':
        return 'Disabled';
      case 'FAILED':
        return 'Failed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'PAUSED':
        return 'Paused';
      default:
        return status;
    }
  };

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
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/campaigns/${campaign.slug}`}
                      target="_blank"
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {campaign.title}
                    </Link>
                    <Badge variant={getStatusVariant(campaign.status)} className="text-xs">
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                  {campaign.startTime && campaign.endTime && (
                    <div className="text-xs text-muted-foreground">
                      Duration: {new Date(campaign.startTime).toLocaleDateString()} - {new Date(campaign.endTime).toLocaleDateString()}
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

export default UserCampaignsCard;
