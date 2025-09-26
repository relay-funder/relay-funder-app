import { useCallback, type ChangeEvent } from 'react';
import { Input, Label } from '@/components/ui';
import { Info } from 'lucide-react';

interface CampaignDonationWalletTipProps {
  tipAmount: string;
  selectedToken: string;
  onTipAmountChanged: (tipAmount: string) => void;
}

export function CampaignDonationWalletTip({
  tipAmount,
  onTipAmountChanged,
}: CampaignDonationWalletTipProps) {
  const intermediateOnTipChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      return onTipAmountChanged(event.target.value);
    },
    [onTipAmountChanged],
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium text-gray-900">
        Add a tip (optional)
        <Info className="h-4 w-4 text-gray-400" />
      </Label>
      <div className="max-w-sm">
        <div className="relative">
          <Input
            type="number"
            value={tipAmount}
            onChange={intermediateOnTipChange}
            placeholder="Enter tip amount"
            className="h-10 pr-20 text-sm"
            min="0"
            step="0.01"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
            USDC
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Tips support the platform and go directly to platform administrators.
      </p>
    </div>
  );
}
