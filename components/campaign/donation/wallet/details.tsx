'use client';

import { useEffect, useMemo, useState } from 'react';

import { DbCampaign } from '@/types/campaign';
import { useDonationContext } from '@/contexts';
import { CampaignDonationWalletAmount } from './amount';
import { CampaignDonationWalletTip } from './tip';
import { CampaignDonationWalletProcess } from './process';
import { CampaignDonationAnonymous } from '../anonymous';
import { VisibilityToggle } from '@/components/visibility-toggle';
import { AlertTriangle } from 'lucide-react';
import { DonationProcessStates } from '@/types/campaign';
import { FeeInformation } from '@/components/shared/fee-information';
import { useQfMatchingEstimate } from '@/lib/hooks/useQfMatchingEstimate';

export function CampaignDonationWalletDetails({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  const {
    isProcessingPayment,
    clearDonation,
    amount,
    tipAmount,
    paymentType,
    usdFormattedBalance,
  } = useDonationContext();

  const [processState, setProcessState] =
    useState<keyof typeof DonationProcessStates>('idle');

  const roundId = campaign.rounds?.[0]?.id;
  const { data: qfEstimate } = useQfMatchingEstimate({
    roundId: roundId ?? 0,
    campaignId: campaign.id,
    amount,
    enabled: !!roundId && !!amount && parseFloat(amount) > 0,
  });

  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const numericTip = useMemo(() => {
    const parsed = parseFloat(tipAmount ?? '0');
    return Number.isFinite(parsed) ? parsed : 0;
  }, [tipAmount]);
  const hasInsufficientBalance = useMemo(() => {
    return (
      usdFormattedBalance.usdBalanceAmount != null &&
      numericAmount + numericTip > usdFormattedBalance.usdBalanceAmount
    );
  }, [numericAmount, numericTip, usdFormattedBalance.usdBalanceAmount]);

  useEffect(() => {
    return () => {
      clearDonation();
    };
  }, [clearDonation]);

  return (
    <div className="relative flex flex-col gap-6">
      <VisibilityToggle
        isVisible={!isProcessingPayment && processState !== 'done'}
      >
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
      {processState !== 'done' &&
        hasInsufficientBalance &&
        paymentType === 'wallet' && (
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

      {processState !== 'done' && (
        <FeeInformation
          isDaimoPay={paymentType === 'daimo'}
          donationAmount={parseFloat(amount || '0')}
          tipAmount={parseFloat(tipAmount || '0')}
          qfMatch={
            qfEstimate ? parseFloat(qfEstimate.marginalMatch) : undefined
          }
          className="w-full"
        />
      )}

      <CampaignDonationWalletProcess
        campaign={campaign}
        state={processState}
        setState={setProcessState}
      />
    </div>
  );
}
