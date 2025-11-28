'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import {
  Wallet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminWithdrawalsStats } from '@/lib/hooks/useAdminWithdrawals';

export function AdminWithdrawalManagementCard() {
  const { data: stats, isLoading } = useAdminWithdrawalsStats();
  const pendingCount = stats?.pendingCount ?? 0;
  const totalCount = stats?.totalCount ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Withdrawal Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Pending Requests
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : pendingCount > 0 ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-amber-600">
                  {pendingCount}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">None</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total Withdrawals
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-sm font-medium">{totalCount}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button asChild variant="default" className="w-full">
            <Link href="/admin/withdrawals">
              <Wallet className="mr-2 h-4 w-4" />
              Manage Withdrawals
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            View, approve, and execute withdrawal requests. Authorize treasury
            withdrawals on-chain.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
