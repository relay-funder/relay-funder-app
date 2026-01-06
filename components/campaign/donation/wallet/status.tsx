'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { useNetworkCheck } from '@/hooks/use-network';
import { chainConfig } from '@/lib/web3';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { useConnectedAccount } from '@/lib/web3';
import { Button } from '@/components/ui';
import { useMemo } from 'react';
import { useDonationContext } from '@/contexts';

export function CampaignDonationWalletStatus() {
  const { isCorrectNetwork } = useNetworkCheck();
  const { usdFormattedBalance, celoFormattedBalance } = useDonationContext();

  const {
    isPending: usdBalanceIsPending,
    usdSymbol,
    hasUsdBalance,
    usdBalanceWithSymbol,
  } = usdFormattedBalance;
  const {
    isPending: celoBalanceIsPending,
    celoSymbol,
    hasCeloBalance,
    celoBalanceWithSymbol,
  } = celoFormattedBalance;

  const isPending = usdBalanceIsPending || celoBalanceIsPending;

  const { isEmbedded, openUi } = useConnectedAccount();

  const noBalanceMessage = useMemo(() => {
    if (!hasUsdBalance && !hasCeloBalance) {
      return `You need ${usdSymbol} and ${celoSymbol} to contribute. Get them from an exchange or on-ramp service.`;
    }
    if (!hasUsdBalance) {
      return `You need ${usdSymbol} to contribute. Get it from an exchange or on-ramp service.`;
    }
    return `You need ${celoSymbol} for gas fees. Get it from an exchange or on-ramp service.`;
  }, [hasUsdBalance, hasCeloBalance, usdSymbol, celoSymbol]);

  return (
    <div className="space-y-2">
      {/* Compact Network & Balance Status */}
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            {isCorrectNetwork ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-bio" />
                <span className="text-xs font-medium text-foreground">
                  {chainConfig.name} Network
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-solar" />
                <span className="text-xs font-medium text-foreground">
                  Wrong Network
                </span>
              </>
            )}
          </div>

          {isCorrectNetwork && (
            <div className="flex flex-col gap-1.5 sm:items-end sm:text-right">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Your available balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {usdBalanceIsPending ? 'Loading...' : usdBalanceWithSymbol}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {celoSymbol} for gas:{' '}
                    <span className="font-semibold text-foreground">
                      {celoBalanceIsPending
                        ? 'Loading...'
                        : celoBalanceWithSymbol}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isCorrectNetwork && (
          <div className="mt-2">
            <PaymentSwitchWalletNetwork />
          </div>
        )}

        {isCorrectNetwork &&
          !isPending &&
          (!hasUsdBalance || !hasCeloBalance) && (
            <>
              {isEmbedded && !hasUsdBalance && (
                <div className="mt-2">
                  <Button
                    onClick={openUi}
                    variant="default"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Fund Embedded Wallet
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your balance is insufficient. Use this button to fund your
                    embedded wallet.
                  </p>
                </div>
              )}

              <div className="mt-2 text-xs text-solar">
                ⚠️ {noBalanceMessage}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
