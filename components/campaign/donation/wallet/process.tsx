import { Button } from '@/components/ui';
import { useDonationCallback } from '@/hooks/use-donation';
import type { Campaign } from '@/types/campaign';
import { useEffect, useMemo } from 'react';

export function CampaignDonationWalletProcess({
  campaign,
  amount,
  selectedToken,
  donationToAkashic,
  onProcessing,
}: {
  campaign: Campaign;
  amount: string;
  selectedToken: string;
  donationToAkashic: number;
  onProcessing: (processing: boolean) => void;
}) {
  const {
    onDonate,
    isProcessing,
    error: donateError,
  } = useDonationCallback({
    campaign,
    amount,
    selectedToken,
  });
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
  useEffect(() => {
    onProcessing(isProcessing);
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
