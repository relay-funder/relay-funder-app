import { Button } from '@/components/ui';
import { DEFAULT_SUGGESTED_DONATION_AMOUNTS } from '@/lib/constant';
import { useDonationContext } from '@/contexts';

interface SuggestionsProps {
  currency: string; // The currency parameter as requested
}

export function CampaignDonationSuggestions({ currency }: SuggestionsProps) {
  const { amount, setAmount } = useDonationContext();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Quick amounts:
      </label>
      <div className="grid grid-cols-5 gap-2">
        {DEFAULT_SUGGESTED_DONATION_AMOUNTS.map((suggestedAmount) => {
          const suggestedAmountString = suggestedAmount.toString();
          const isSelected = amount === suggestedAmountString;
          return (
            <Button
              key={suggestedAmount}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => setAmount(suggestedAmountString)}
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
