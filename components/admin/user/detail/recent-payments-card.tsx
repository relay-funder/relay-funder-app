'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { PaymentWithCampaignLite } from '@/lib/api/types';

export interface RecentPaymentsCardProps {
  payments: PaymentWithCampaignLite[];
  className?: string;
  title?: string;
}

export function RecentPaymentsCard({
  payments,
  className,
  title = 'Recent Payments',
}: RecentPaymentsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No payments</div>
        ) : (
          <div className="divide-y">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm">
                    {p.amount} {p.token}{' '}
                    <span className="text-muted-foreground">• {p.type}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    Status: {p.status}
                  </div>
                  {p.campaign && (
                    <div className="truncate text-xs">
                      <Link
                        href={`/campaigns/${p.campaign.slug}`}
                        className="text-primary hover:underline"
                      >
                        {p.campaign.title}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="ml-4 shrink-0 text-xs text-muted-foreground">
                  {new Date(p.createdAt as unknown as string).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentPaymentsCard;
