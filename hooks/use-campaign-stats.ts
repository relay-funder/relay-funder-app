import type { GetCampaignResponse } from '@/lib/api/types';
import { formatUSD } from '@/lib/format-usd';
import { useCampaign } from '@/lib/hooks/useCampaigns';
import { useTreasuryBalance } from '@/hooks/use-treasury-balance';
import { DbCampaign } from '@/types/campaign';
import { useMemo } from 'react';

export function useCampaignStats({ slug }: { slug: string }) {
  const { data, isPending } = useCampaign(slug);
  const { campaign } = data ?? ({} as GetCampaignResponse);

  // Fetch treasury balance separately if available
  const { data: treasuryBalance, isLoading: isTreasuryBalanceLoading } =
    useTreasuryBalance(campaign?.treasuryAddress ?? null);

  return {
    ...useCampaignStatsFromInstance({
      campaign,
      treasuryBalance: treasuryBalance ?? campaign?.treasuryBalance,
    }),
    isPending,
    isTreasuryBalanceLoading,
  };
}
export function useCampaignStatsFromInstance({
  campaign,
  treasuryBalance,
}: {
  campaign?: DbCampaign;
  treasuryBalance?: {
    available: string;
    totalPledged: string;
    currency: string;
  } | null;
}) {
  const paymentSummary = campaign?.paymentSummary;
  const contributorPendingCount = paymentSummary?.countPending ?? 0;
  const contributorCount =
    (paymentSummary?.countConfirmed ?? 0) + contributorPendingCount;

  const [amountRaisedFloat, amountPendingFloat] = useMemo(() => {
    if (!paymentSummary?.token) {
      return [0, 0];
    }
    const floatAmounts = Object.entries(paymentSummary.token).reduce(
      (accumulator, [token, amount]) => {
        if (token.toLowerCase().includes('usd')) {
          return [
            accumulator[0] + amount.confirmed,
            accumulator[1] + amount.pending,
          ];
        }
        // todo, add other tokens with exchange rate
        return accumulator;
      },
      [0, 0],
    );
    return floatAmounts;
  }, [paymentSummary]);

  const amountGoalFloat = useMemo(
    () => Number(campaign?.fundingGoal) || 0,
    [campaign?.fundingGoal],
  );
  const amountUnrealizedFloat = useMemo(
    () => amountPendingFloat + amountRaisedFloat,
    [amountPendingFloat, amountRaisedFloat],
  );

  const progress = useMemo(() => {
    if (amountGoalFloat === 0) {
      return 0;
    }
    return (
      Math.round(
        Math.min((amountRaisedFloat / amountGoalFloat) * 100, 100) * 100,
      ) / 100 //  ensure only two places are passed to the frontend
    );
  }, [amountRaisedFloat, amountGoalFloat]);

  const [amountRaised, amountPending, amountGoal, amountUnrealized] =
    useMemo(() => {
      return [
        formatUSD(amountRaisedFloat),
        formatUSD(amountPendingFloat),
        formatUSD(amountGoalFloat),
        formatUSD(amountUnrealizedFloat),
      ];
    }, [
      amountRaisedFloat,
      amountPendingFloat,
      amountGoalFloat,
      amountUnrealizedFloat,
    ]);
  return {
    amountRaised,
    amountPending,
    amountGoal,
    amountUnrealized,
    amountRaisedFloat,
    amountPendingFloat,
    amountGoalFloat,
    amountUnrealizedFloat,
    progress,
    contributorCount,
    contributorPendingCount,
    treasuryBalance,
  };
}
