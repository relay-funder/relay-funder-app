'use client';

import { USD_ADDRESS } from '@/lib/constant';
import { useTokenBalance } from '@/lib/web3/hooks/use-token-balance';

export function useUsdBalance({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, isPending } = useTokenBalance({
    token: USD_ADDRESS as `0x${string}`,
    enabled,
  });

  console.log(isPending, data);
  const usdBalance = data?.formatted ?? '0';

  return { usdBalance, isPending };
}
