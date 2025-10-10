import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Input, Label } from '@/components/ui';
import { Info } from 'lucide-react';
import { debugHook as debug } from '@/lib/debug';

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
    debug &&
      console.log('Tip calculation:', {
        percentage,
        amount,
        tip: tip.toFixed(2),
        total: (parseFloat(amount || '0') + tip).toFixed(2),
      });
    onTipAmountChanged(tip.toFixed(2));
  }, [percentage, amount, onTipAmountChanged]);

  const handlePercentageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newPercentage = Number(event.target.value);
      setPercentage(newPercentage);
    },
    [],
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
        Add a tip (optional)
        <Info className="h-4 w-4 text-muted-foreground" />
      </Label>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Label className="text-sm text-muted-foreground">Percentage:</Label>
          <input
            type="range"
            min={MIN_PERCENTAGE}
            max={MAX_PERCENTAGE}
            value={percentage}
            onChange={handlePercentageChange}
            className="flex-1 accent-quantum dark:accent-quantum"
          />
          <span className="text-sm font-medium text-foreground">
            {percentage}%
          </span>
        </div>
        <div className="max-w-sm">
          <div className="relative">
            <Input
              type="number"
              value={tipAmount}
              readOnly
              placeholder="Tip calculated from percentage"
              className="h-10 cursor-not-allowed bg-muted pr-20 text-sm"
              min="0"
              step="0.01"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {selectedToken}
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Tips support the platform and go directly to platform administrators.
      </p>
    </div>
  );
}
