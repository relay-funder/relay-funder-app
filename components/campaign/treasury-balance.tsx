import { formatUSD } from '@/lib/format-usd';
import { useTreasuryBalance } from '@/lib/hooks/useTreasuryBalance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet } from 'lucide-react';
import { USD_TOKEN } from '@/lib/constant';

interface TreasuryBalanceProps {
  treasuryAddress: string;
  title?: string;
  className?: string;
}

export function TreasuryBalance({
  treasuryAddress,
  title = 'Treasury Balance',
  className = '',
}: TreasuryBalanceProps) {
  const {
    data: treasuryBalance,
    isLoading,
    error,
  } = useTreasuryBalance(treasuryAddress);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !treasuryBalance) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Treasury balance unavailable
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline" className="text-xs">
          {treasuryBalance.balance?.currency ?? USD_TOKEN}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="text-2xl font-bold">
              {formatUSD(
                parseFloat(treasuryBalance.balance?.totalPledged ?? '0') || 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total Raised</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for use in progress bars or small spaces
export function TreasuryBalanceCompact({
  treasuryAddress,
  className = '',
}: Omit<TreasuryBalanceProps, 'title'>) {
  const { data: treasuryBalance, isLoading } =
    useTreasuryBalance(treasuryAddress);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-sm">Loading balance...</span>
      </div>
    );
  }

  if (!treasuryBalance || !treasuryBalance.balance) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Wallet className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Balance unavailable
        </span>
      </div>
    );
  }

  // Safely parse balance values with fallbacks
  const totalPledged = treasuryBalance.balance?.totalPledged ?? '0';
  const currency = treasuryBalance.balance?.currency ?? USD_TOKEN;

  // Parse as numbers with fallback to 0
  const totalPledgedNum = parseFloat(totalPledged) || 0;

  // For end users, just show total raised amount (totalPledged)
  // Available balance is only relevant for creators doing withdrawals
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Wallet className="h-3 w-3" />
      <span className="text-sm font-medium">
        {formatUSD(totalPledgedNum)} {currency} raised
      </span>
    </div>
  );
}
