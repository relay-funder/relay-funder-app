import { Input } from '@/components/ui';
import { CampaignDonationSuggestions } from '../suggestions';
import { useDonationContext } from '@/contexts';
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';

export function CampaignDonationCreditCardAmount() {
  const { amount, setAmount } = useDonationContext();

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setAmount(e.target.value);
    },
    [setAmount],
  );

  return (
    <div className="flex flex-col space-y-4">
      {/* Suggested amounts */}
      <CampaignDonationSuggestions currency={'USD'} />
      {/* Custom amount input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Or enter a custom amount:
        </label>
        <div className="flex rounded-md border shadow-sm">
          <Input
            type="number"
            value={amount}
            onChange={handleAmountChange}
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
