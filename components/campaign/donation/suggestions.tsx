import { useCallback } from 'react';
import { Button } from '@/components/ui';
import { DEFAULT_SUGGESTED_DONATION_AMOUNTS } from '@/lib/constant';

interface SuggestionsProps {
  amount: string;
  onAmountChanged: (amount: string) => void;
  currency: string; // The currency parameter as requested
}

export function CampaignDonationSuggestions({
  amount,
  onAmountChanged,
  currency, // Accept currency prop
}: SuggestionsProps) {
  const handleSuggestedAmount = useCallback(
    (suggestedAmount: number) => {
      onAmountChanged(suggestedAmount.toString());
    },
    [onAmountChanged],
  );

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Quick amounts:
      </label>
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_SUGGESTED_DONATION_AMOUNTS.map((suggestedAmount) => (
          <Button
            key={suggestedAmount}
            variant={
              amount === suggestedAmount.toString() ? 'default' : 'outline'
            }
            onClick={() => handleSuggestedAmount(suggestedAmount)}
            className="h-10 text-sm font-medium"
            size="default"
          >
            {suggestedAmount} {currency}
          </Button>
        ))}
      </div>
    </div>
  );
}
