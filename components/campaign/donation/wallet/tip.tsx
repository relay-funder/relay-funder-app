import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Input, Label } from '@/components/ui';
import { Info } from 'lucide-react';

interface CampaignDonationWalletTipProps {
  tipAmount: string;
  amount: string;
  selectedToken: string;
  onTipAmountChanged: (tipAmount: string) => void;
}

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 50;
const DEFAULT_PERCENTAGE = 5;

export function CampaignDonationWalletTip({
  tipAmount,
  amount,
  selectedToken,
  onTipAmountChanged,
}: CampaignDonationWalletTipProps) {
  const [percentage, setPercentage] = useState(DEFAULT_PERCENTAGE);

  useEffect(() => {
    const tip = (percentage / 100) * parseFloat(amount || '0');
    onTipAmountChanged(tip.toFixed(2));
  }, [percentage, amount, onTipAmountChanged]);

  const handleTipAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newTipAmount = event.target.value;
      onTipAmountChanged(newTipAmount);
      const newPercentage =
        (parseFloat(newTipAmount || '0') / parseFloat(amount || '1')) * 100;
      setPercentage(
        Math.min(MAX_PERCENTAGE, Math.max(MIN_PERCENTAGE, newPercentage)),
      );
    },
    [onTipAmountChanged, amount],
  );

  const handlePercentageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newPercentage = Number(event.target.value);
      setPercentage(newPercentage);
    },
    [],
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium text-gray-900">
        Add a tip (optional)
        <Info className="h-4 w-4 text-gray-400" />
      </Label>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Label className="text-sm text-gray-700">Percentage:</Label>
          <input
            type="range"
            min={MIN_PERCENTAGE}
            max={MAX_PERCENTAGE}
            value={percentage}
            onChange={handlePercentageChange}
            className="flex-1 accent-black"
          />
          <span className="text-sm font-medium text-gray-900">
            {percentage}%
          </span>
        </div>
        <div className="max-w-sm">
          <div className="relative">
            <Input
              type="number"
              value={tipAmount}
              onChange={handleTipAmountChange}
              placeholder="Enter tip amount"
              className="h-10 pr-20 text-sm"
              min="0"
              step="0.01"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              {selectedToken}
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Tips support the platform and go directly to platform administrators.
      </p>
    </div>
  );
}
