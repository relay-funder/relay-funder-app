'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useTreasuryWithdrawalStatus } from '@/lib/web3/hooks/useTreasuryWithdrawalStatus';

export interface TreasuryAuthorizationStatusProps {
  treasuryAddress?: string | null;
  onChainAuthorized?: boolean; // Database status
  showLabel?: boolean;
  className?: string;
}

/**
 * Component to display treasury withdrawal authorization status.
 * Shows both on-chain status (from contract) and database status.
 */
export function TreasuryAuthorizationStatus({
  treasuryAddress,
  onChainAuthorized = false,
  showLabel = true,
  className,
}: TreasuryAuthorizationStatusProps) {
  const { isAuthorized: onChainStatus, isLoading } =
    useTreasuryWithdrawalStatus(treasuryAddress);

  // Use on-chain status if available, otherwise fall back to database status
  const isAuthorized = treasuryAddress ? onChainStatus : onChainAuthorized;

  if (isLoading && treasuryAddress) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        {showLabel && (
          <span className="text-sm text-muted-foreground">Status:</span>
        )}
        <Badge variant="outline" className="bg-gray-50">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Checking...
        </Badge>
      </div>
    );
  }

  if (isAuthorized) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        {showLabel && (
          <span className="text-sm text-muted-foreground">Status:</span>
        )}
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Authorized
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      {showLabel && (
        <span className="text-sm text-muted-foreground">Status:</span>
      )}
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Not Authorized
      </Badge>
    </div>
  );
}
