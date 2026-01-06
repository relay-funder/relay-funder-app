'use client';

import { USD_ADDRESS, USD_TOKEN } from '@/lib/constant';
import { useFormattedTokenBalance } from '@/lib/web3/hooks/use-token-balance';

export interface UsdFormattedBalance {
  usdBalance: string;
  usdBalanceAmount: number;
  usdSymbol: string;
  usdBalanceWithSymbol: string;
  hasUsdBalance: boolean;
  isPending: boolean;
}

export function useUsdBalance({ enabled = true }: { enabled?: boolean } = {}) {
  const {
    balance,
    balanceAmount,
    symbol,
    balanceWithSymbol,
    hasBalance,
    isPending,
  } = useFormattedTokenBalance({
    token: USD_ADDRESS as `0x${string}`,
    symbol: USD_TOKEN,
    enabled,
  });

  return {
    usdBalance: balance,
    usdBalanceAmount: balanceAmount,
    usdSymbol: symbol,
    usdBalanceWithSymbol: balanceWithSymbol,
    hasUsdBalance: hasBalance,
    isPending,
  };
}
