'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { WithdrawalWithCampaignLite } from '@/lib/api/types';

export interface ApprovalsCardProps {
  approvals: WithdrawalWithCampaignLite[];
  className?: string;
  title?: string;
}

/**
 * ApprovalsCard
 * Renders a list of withdrawals approved by the user.
 *
 * - Shows amount and token
 * - Links campaign when available
 * - Displays transaction hash (if any)
 * - Created at timestamp
 */
export function ApprovalsCard({
  approvals,
  className,
  title = 'Approvals',
}: ApprovalsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <div className="text-sm text-muted-foreground">No approvals</div>
        ) : (
          <div className="divide-y">
            {approvals.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="text-sm">
                    {w.amount} {w.token}
                  </div>

                  {w.campaign && (
                    <div className="truncate text-xs">
                      <Link
                        href={`/campaigns/${w.campaign.slug}`}
                        className="text-primary hover:underline"
                      >
                        {w.campaign.title}
                      </Link>
                    </div>
                  )}

                  {w.transactionHash && (
                    <div
                      className="truncate text-xs text-muted-foreground"
                      title={w.transactionHash ?? undefined}
                    >
                      Tx: {w.transactionHash}
                    </div>
                  )}
                </div>

                <div className="ml-4 shrink-0 text-xs text-muted-foreground">
                  {new Date(w.createdAt as unknown as string).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ApprovalsCard;
