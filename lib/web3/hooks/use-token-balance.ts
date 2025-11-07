'use client';

import type { Address } from 'viem';
import { useBalance, useAccount, formatUnits } from '@/lib/web3';
import { useMemo } from 'react';

export function useTokenBalance({
  token,
  address,
  enabled = true,
}: {
  token: Address;
  address?: Address;
  enabled?: boolean;
}) {
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
    return {
      ...data,
      formatted: formatUnits(data.value, data.decimals),
    };
  }, [data]);

  return { data: newData, ...rest };
}
