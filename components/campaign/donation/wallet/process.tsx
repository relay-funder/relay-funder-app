import { Button } from '@/components/ui';
import { useDonationCallback } from '@/hooks/use-donation';
import type { Campaign } from '@/types/campaign';
import { useEffect, useMemo } from 'react';

export function CampaignDonationWalletProcess({
  campaign,
  amount,
  selectedToken,
  donationToAkashic,
  anonymous,
  onProcessing,
}: {
  campaign: Campaign;
  amount: string;
  selectedToken: string;
  donationToAkashic: number;
  anonymous: boolean;
  onProcessing?: (processing: boolean) => void;
}) {
  const numericAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const akashicAmount = useMemo(() => {
    if (donationToAkashic) {
      return (numericAmount * donationToAkashic) / 100;
    }
    return 0;
  }, [numericAmount, donationToAkashic]);
  const poolAmount = useMemo(() => {
    return numericAmount - akashicAmount;
  }, [numericAmount, akashicAmount]);
  const { onDonate, isProcessing } = useDonationCallback({
    campaign,
    amount,
    poolAmount,
    isAnonymous: anonymous,
    selectedToken,
  });
  useEffect(() => {
    if (typeof onProcessing === 'function') {
      onProcessing(isProcessing);
    }
  }, [onProcessing, isProcessing]);
  return (
    <Button
      className="w-full"
      size="lg"
      disabled={!numericAmount || isProcessing}
      onClick={onDonate}
    >
      {isProcessing ? 'Processing...' : `Donate with Wallet`}
    </Button>
  );
}
