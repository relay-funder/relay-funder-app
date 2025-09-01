import { useBalance, useAccount, formatUnits } from '@/lib/web3';
import { USDC_ADDRESS } from '@/lib/constant';
import { useMemo } from 'react';

export function useUsdcBalance() {
  const { address } = useAccount();

  const { data: usdcBalance, isPending: usdcBalanceIsPending } = useBalance({
    address,
    token: USDC_ADDRESS as `0x${string}`,
  });
  const usdcBalanceFormatted = useMemo(() => {
    return formatUnits(
      usdcBalance?.value ?? BigInt(0),
      usdcBalance?.decimals ?? 0,
    );
  }, [usdcBalance?.value, usdcBalance?.decimals]);

  return { usdcBalance: usdcBalanceFormatted, isPending: usdcBalanceIsPending };
}
