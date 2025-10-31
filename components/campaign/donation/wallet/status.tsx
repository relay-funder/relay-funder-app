'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { useNetworkCheck } from '@/hooks/use-network';
import { chainConfig, useBalance, useAccount, formatUnits } from '@/lib/web3';
import { useUsdBalance } from '@/lib/web3/hooks/use-usd-balance';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { formatCrypto } from '@/lib/format-crypto';
import { useConnectedAccount } from '@/lib/web3';
import { Button } from '@/components/ui';
import { USD_TOKEN } from '@/lib/constant';
import { useMemo } from 'react';

export function CampaignDonationWalletStatus() {
  const { isCorrectNetwork } = useNetworkCheck();
  const { usdBalance, isPending: usdBalanceIsPending } = useUsdBalance();
  const { address } = useAccount();

  // Get native CELO balance for gas fees
  const { data: celoBalance, isPending: celoBalanceIsPending } = useBalance({
    address,
  });

  const celoBalanceFormatted = useMemo(() => {
    if (!celoBalance?.value) return '0';
    return formatUnits(
      celoBalance.value,
      celoBalance.decimals ?? chainConfig.nativeCurrency.decimals,
    );
  }, [celoBalance?.value, celoBalance?.decimals]);

  const celoBalanceAmount = parseFloat(celoBalanceFormatted);
  const nativeCurrencySymbol = chainConfig.nativeCurrency.symbol;

  const hasBalance = usdBalance && parseFloat(usdBalance) > 0;
  const balanceAmount = usdBalance ? parseFloat(usdBalance) : 0;
  const { isEmbedded, openUi } = useConnectedAccount();

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
                    {usdBalanceIsPending
                      ? 'Loading...'
                      : formatCrypto(balanceAmount, USD_TOKEN)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {nativeCurrencySymbol} for gas:{' '}
                    <span className="font-semibold text-foreground">
                      {celoBalanceIsPending
                        ? 'Loading...'
                        : formatCrypto(celoBalanceAmount, nativeCurrencySymbol)}
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
          !usdBalanceIsPending &&
          !celoBalanceIsPending &&
          (!hasBalance || celoBalanceAmount === 0) && (
            <>
              {isEmbedded && !hasBalance && (
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

              {(!hasBalance || celoBalanceAmount === 0) && (
                <div className="mt-2 text-xs text-solar">
                  ⚠️{' '}
                  {!hasBalance && celoBalanceAmount === 0
                    ? `You need ${USD_TOKEN} and ${nativeCurrencySymbol} to contribute. Get them from an exchange or on-ramp service.`
                    : !hasBalance
                      ? `You need ${USD_TOKEN} to contribute. Get it from an exchange or on-ramp service.`
                      : `You need ${nativeCurrencySymbol} for gas fees. Get it from an exchange or on-ramp service.`}
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}
