'use client';

import { useEffect, useMemo } from 'react';

import { DbCampaign } from '@/types/campaign';
import { useDonationContext } from '@/contexts';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletTip } from './tip';
import { CampaignDonationWalletProcess } from './process';
import { CampaignDonationAnonymous } from '../anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { PaymentTotalSummary } from '../payment-total-summary';
import { AlertTriangle } from 'lucide-react';

export function CampaignDonationWalletDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const { isProcessingPayment, clearDonation, amount, tipAmount, paymentType, usdFormattedBalance } =
    useDonationContext();

  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const hasInsufficientBalance = useMemo(() => {
    return (
      usdFormattedBalance.usdBalanceAmount != null &&
      (numericAmount + parseFloat(tipAmount || '0')) > usdFormattedBalance.usdBalanceAmount
    );
  }, [numericAmount, tipAmount, usdFormattedBalance.usdBalanceAmount]);

  useEffect(() => {
    return () => {
      clearDonation();
    };
  }, [clearDonation]);

  return (
    <div className="relative flex flex-col gap-6">
      <VisibilityToggle isVisible={!isProcessingPayment}>
        <div className="space-y-6">
          <CampaignDonationWalletAmount />

          {/* Two-column grid for tip and privacy settings on desktop */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CampaignDonationWalletTip />
            <CampaignDonationAnonymous />
          </div>
        </div>
      </VisibilityToggle>

      {/* Insufficient balance warning - only for wallet payments */}
      {hasInsufficientBalance && paymentType === 'wallet' && (
        <div className="flex items-center gap-2 rounded-md border border-orange-200/60 bg-orange-50/70 p-3 text-sm text-orange-800 dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-100">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-600 dark:text-blue-300" />
          <span>
            Insufficient balance. You have{' '}
            <span className="font-medium text-orange-900 dark:text-blue-50">
              {usdFormattedBalance.usdBalanceWithSymbol}
            </span>{' '}
            available.
          </span>
        </div>
      )}

      <PaymentTotalSummary amount={amount} tipAmount={tipAmount} />

      <CampaignDonationWalletProcess campaign={campaign} />
    </div>
  );
}
