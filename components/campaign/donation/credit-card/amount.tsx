import { useCallback, type ChangeEvent } from 'react';
import { Input } from '@/components/ui';
import { CampaignDonationSuggestions } from '../suggestions';

export function CampaignDonationCreditCardAmount({
  amount,
  onAmountChanged,
}: {
  amount: string;
  onAmountChanged: (amount: string) => void;
}) {
  const intermediateOnAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      return onAmountChanged(event.target.value);
    },
    [onAmountChanged],
  );
  return (
    <div className="flex flex-col space-y-4">
      {/* Suggested amounts */}
      <CampaignDonationSuggestions
        amount={amount}
        onAmountChanged={onAmountChanged}
        currency={'USD'}
      />
      {/* Custom amount input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Or enter a custom amount:
        </label>
        <div className="flex rounded-md border shadow-sm">
          <Input
            type="number"
            value={amount}
            onChange={intermediateOnAmountChange}
            className="ml-1 rounded-l-none border-0"
          />
          <div className="flex items-center px-3 text-sm text-muted-foreground">
            USD
          </div>
        </div>
      </div>
    </div>
  );
}
