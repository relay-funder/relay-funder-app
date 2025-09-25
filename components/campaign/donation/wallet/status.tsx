'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { useNetworkCheck } from '@/hooks/use-network';
import { chainConfig } from '@/lib/web3';
import { useUsdcBalance } from '@/lib/web3/hooks/use-usdc-balance';
import { PaymentSwitchWalletNetwork } from '@/components/payment/switch-wallet-network';
import { formatCrypto } from '@/lib/format-crypto';


export function CampaignDonationWalletStatus() {
  const { isCorrectNetwork } = useNetworkCheck();
  const { usdcBalance, isPending: usdBalanceIsPending } = useUsdcBalance();

  const hasBalance = usdcBalance && parseFloat(usdcBalance) > 0;
  const balanceAmount = usdcBalance ? parseFloat(usdcBalance) : 0;

  return (
    <div className="space-y-3">
      {/* Compact Network & Balance Status */}
      <div className="rounded-lg border bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCorrectNetwork ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-900">
                  {chainConfig.name} Network
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-gray-900">Wrong Network</span>
              </>
            )}
          </div>

          {isCorrectNetwork && (
            <div className="text-sm font-medium text-gray-900">
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
          <div className="mt-2 text-xs text-amber-700">
            ⚠️ You need USDC to contribute. Get it from an exchange or on-ramp
            service.
          </div>
        )}
      </div>
    </div>
  );
}
