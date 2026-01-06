import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { DEFAULT_SUGGESTED_DONATION_AMOUNTS } from '@/lib/constant';
import { useDonationContext } from '@/contexts';

interface SuggestionsProps {
  currency: string; // The currency parameter as requested
}

const suggestedAmounts = DEFAULT_SUGGESTED_DONATION_AMOUNTS.map(
  (suggestedAmount) => suggestedAmount.toString(),
);

export function CampaignDonationSuggestions({ currency }: SuggestionsProps) {
  const { amount, setAmount } = useDonationContext();

  const handlers = useMemo(
    () =>
      Object.fromEntries(
        suggestedAmounts.map((suggestedAmount) => {
          return [suggestedAmount, () => setAmount(suggestedAmount)];
        }),
      ),
    [setAmount],
  );

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Quick amounts:
      </label>
      <div className="grid grid-cols-5 gap-2">
        {suggestedAmounts.map((suggestedAmount) => {
          const isSelected = amount === suggestedAmount;
          return (
            <Button
              key={suggestedAmount}
              variant={isSelected ? 'default' : 'outline'}
              onClick={handlers[suggestedAmount]}
              className="h-10 text-sm font-medium"
              size="default"
            >
              {suggestedAmount} {currency}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
