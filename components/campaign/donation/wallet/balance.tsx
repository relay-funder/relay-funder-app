'use client';
import { useMemo } from 'react';
import { useUsdcBalance } from '@/lib/web3/hooks/use-usdc-balance';
import { HelpCircle, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
export function CampaignDonationWalletBalance({
  selectedToken,
}: {
  selectedToken: string;
}) {
  const { usdcBalance, isPending: usdBalanceIsPending } = useUsdcBalance();
  const availableBalance = useMemo(() => {
    if (selectedToken === 'USDC') {
      if (usdBalanceIsPending) {
        return (
          <>
            <Loader2 /> Pending
          </>
        );
      }
      return usdcBalance;
    }
    return 'unknown';
  }, [usdcBalance, selectedToken, usdBalanceIsPending]);

  return (
    <div className="space-y-1">
      <label className="text-base font-medium text-foreground">
        Available Balance
      </label>
      <div className="flex flex-nowrap text-sm text-muted-foreground">
        {availableBalance} {selectedToken}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="ml-1 inline h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Your available balance in {selectedToken}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
