'use client';

import Link from 'next/link';
import { ExternalLink, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import {
  WithdrawalStatusBadge,
  getWithdrawalStatus,
  type WithdrawalStatus,
} from './withdrawal-status-badge';
import type { UserWithdrawal } from '@/lib/api/types';
import { chainConfig } from '@/lib/web3';

interface WithdrawalHistoryCardProps {
  withdrawal: UserWithdrawal;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatAmount(amount: string, token: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${amount} ${token}`;
  return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${token}`;
}

interface StatusIconProps {
  status: WithdrawalStatus;
}

function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'executed':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'approved':
      return <Loader2 className="h-5 w-5 animate-spin text-amber-600" />;
    case 'pending':
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

export function WithdrawalHistoryCard({
  withdrawal,
}: WithdrawalHistoryCardProps) {
  const status = getWithdrawalStatus(withdrawal);

  return (
    <Card className="overflow-hidden bg-card transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <StatusIcon status={status} />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="text-2xl font-bold text-foreground">
                {formatAmount(withdrawal.amount, withdrawal.token)}
              </div>
              <WithdrawalStatusBadge status={status} />
            </div>

            <div className="text-sm text-muted-foreground">
              <Link
                href={`/campaigns/${withdrawal.campaign.slug}`}
                className="font-medium text-foreground hover:text-accent-foreground"
              >
                {withdrawal.campaign.title}
              </Link>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Requested {formatDate(withdrawal.createdAt)}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {withdrawal.transactionHash && (
              <a
                href={`${chainConfig.blockExplorerUrl}/tx/${withdrawal.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-accent-foreground"
                title="View transaction details"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
