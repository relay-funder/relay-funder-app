'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { useNetworkCheck } from '@/hooks/use-network';
import { chainConfig } from '@/lib/web3';
import { useUsdcBalance } from '@/lib/web3/hooks/use-usdc-balance';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { formatCrypto } from '@/lib/format-crypto';
import { useConnectedAccount } from '@/lib/web3';
import { Button } from '@/components/ui';

export function CampaignDonationWalletStatus() {
  const { isCorrectNetwork } = useNetworkCheck();
  const { usdcBalance, isPending: usdBalanceIsPending } = useUsdcBalance();

  const hasBalance = usdcBalance && parseFloat(usdcBalance) > 0;
  const balanceAmount = usdcBalance ? parseFloat(usdcBalance) : 0;
  const { isEmbedded, openUi } = useConnectedAccount();

  return (
    <div className="space-y-3">
      {/* Compact Network & Balance Status */}
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCorrectNetwork ? (
              <>
                <CheckCircle className="h-4 w-4 text-bio" />
                <span className="text-sm text-foreground">
                  {chainConfig.name} Network
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-solar" />
                <span className="text-sm text-foreground">Wrong Network</span>
              </>
            )}
          </div>

          {isCorrectNetwork && (
            <div className="text-sm font-medium text-foreground">
              {usdBalanceIsPending
                ? 'Loading...'
                : formatCrypto(balanceAmount, 'USDC')}
            </div>
          )}
        </div>

        {!isCorrectNetwork && (
          <div className="mt-2">
            <PaymentSwitchWalletNetwork />
          </div>
        )}

        {!hasBalance && !usdBalanceIsPending && isCorrectNetwork && (
          <div className="mt-2">
            {isEmbedded ? (
              <>
                <Button
                  onClick={openUi}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  Fund Embedded Wallet
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your balance is insufficient. Use this button to fund your
                  embedded wallet.
                </p>
              </>
            ) : (
              <div className="text-xs text-solar">
                ⚠️ You need USDC to contribute. Get it from an exchange or
                on-ramp service.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
