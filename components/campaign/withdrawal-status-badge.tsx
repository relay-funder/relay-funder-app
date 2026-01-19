'use client';

import { Badge } from '@/components/ui';

export type WithdrawalStatus = 'pending' | 'approved' | 'executed';

export function getWithdrawalStatus(withdrawal: {
  approvedById: number | null;
  transactionHash: string | null;
}): WithdrawalStatus {
  if (withdrawal.transactionHash) return 'executed';
  if (withdrawal.approvedById) return 'approved';
  return 'pending';
}

interface WithdrawalStatusBadgeProps {
  status: WithdrawalStatus;
}

export function WithdrawalStatusBadge({ status }: WithdrawalStatusBadgeProps) {
  switch (status) {
    case 'executed':
      return (
        <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
      );
    case 'approved':
      return (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          Processing
        </Badge>
      );
    case 'pending':
    default:
      return <Badge variant="secondary">Pending Approval</Badge>;
  }
}
