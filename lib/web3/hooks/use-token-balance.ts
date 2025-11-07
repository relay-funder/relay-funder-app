'use client';

import { useMemo } from 'react';
import type { Address } from 'viem';
import { useBalance, useAccount, formatUnits, chainConfig } from '@/lib/web3';
import { formatCrypto } from '@/lib/format-crypto';

interface UseTokenBalanceProps {
  token?: Address;
  address?: Address;
  enabled?: boolean;
}

export function useTokenBalance({
  token,
  address,
  enabled = true,
}: UseTokenBalanceProps = {}) {
  const { address: accountAddress } = useAccount();

  const result = useBalance({
    address: address ?? accountAddress,
    token,
    query: {
      enabled,
    },
  });

  const { data, ...rest } = result;

  const newData = useMemo(() => {
    if (!data) return;
    const formatted = formatUnits(data.value, data.decimals);
    const amount = parseFloat(formatted);
    console.log(formatted);
    return {
      ...data,
      formatted,
      amount,
    };
  }, [data]);

  return { data: newData, ...rest };
}

interface UseFormattedTokenBalanceProps extends UseTokenBalanceProps {
  symbol: string;
}

interface FormattedTokenBalance {
  balance: string;
  balanceAmount: number;
  symbol: string;
  balanceWithSymbol: string;
  hasBalance: boolean;
  isPending: boolean;
}

export function useFormattedTokenBalance({
  token,
  address,
  symbol: defaultSymbol,
  enabled = true,
}: UseFormattedTokenBalanceProps): FormattedTokenBalance {
  const { data, isPending } = useTokenBalance({
    token,
    address,
    enabled,
  });

  const balance = data?.formatted ?? '0';
  const balanceAmount = data?.amount ?? 0;
  const symbol = data?.symbol ?? defaultSymbol; // It might change USDT/USDC or CELO/S-CELO
  const balanceWithSymbol = formatCrypto(balanceAmount, symbol);
  const hasBalance = balanceAmount > 0;

  return {
    balance,
    balanceAmount,
    symbol,
    balanceWithSymbol,
    hasBalance,
    isPending,
  };
}

export interface CeloFormattedBalance {
  celoBalance: string;
  celoBalanceAmount: number;
  celoSymbol: string;
  celoBalanceWithSymbol: string;
  hasCeloBalance: boolean;
  isPending: boolean;
}

export function useCeloBalance({ enabled = true }: { enabled?: boolean } = {}) {
  const defaultSymbol = chainConfig.nativeCurrency.symbol;
  const {
    balance,
    balanceAmount,
    symbol,
    balanceWithSymbol,
    hasBalance,
    isPending,
  } = useFormattedTokenBalance({
    symbol: defaultSymbol,
    enabled,
  });
  return {
    celoBalance: balance,
    celoBalanceAmount: balanceAmount,
    celoSymbol: symbol,
    celoBalanceWithSymbol: balanceWithSymbol,
    hasCeloBalance: hasBalance,
    isPending,
  };
}
