import { useCallback, type ChangeEvent } from 'react';
import { Input, Label } from '@/components/ui';
import { formatCrypto } from '@/lib/format-crypto';
import { Info } from 'lucide-react';

interface CampaignDonationWalletTipProps {
  tipAmount: string;
  selectedToken: string;
  onTipAmountChanged: (tipAmount: string) => void;
}

export function CampaignDonationWalletTip({
  tipAmount,
  selectedToken,
  onTipAmountChanged,
}: CampaignDonationWalletTipProps) {
  const intermediateOnTipChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      return onTipAmountChanged(event.target.value);
    },
    [onTipAmountChanged],
  );

  const numericTipAmount = parseFloat(tipAmount) || 0;

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        Add a tip (optional)
        <Info className="h-3 w-3 text-gray-400" />
      </Label>
      <div className="flex rounded-md border shadow-sm">
        <Input
          type="number"
          value={tipAmount}
          onChange={intermediateOnTipChange}
          placeholder="0.00"
          className="flex-1 rounded-r-none border-0"
          min="0"
          step="0.01"
        />
        <div className="flex items-center px-3 text-sm text-muted-foreground bg-muted border-l rounded-r-md">
          {formatCrypto(numericTipAmount, selectedToken)}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Tips support the platform and go directly to platform administrators.
      </p>
    </div>
  );
}
