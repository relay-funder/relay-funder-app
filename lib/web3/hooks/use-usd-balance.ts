import { useBalance, useAccount, formatUnits } from '@/lib/web3';
import { USD_ADDRESS } from '@/lib/constant';
import { useMemo } from 'react';

export function useUsdBalance() {
  const { address } = useAccount();

  const { data: usdBalance, isPending: usdBalanceIsPending } = useBalance({
    address,
    token: USD_ADDRESS as `0x${string}`,
  });
  const usdBalanceFormatted = useMemo(() => {
    return formatUnits(
      usdBalance?.value ?? BigInt(0),
      usdBalance?.decimals ?? 0,
    );
  }, [usdBalance?.value, usdBalance?.decimals]);

  return { usdBalance: usdBalanceFormatted, isPending: usdBalanceIsPending };
}
