import { useCallback, type ChangeEvent } from 'react';
import { Input } from '@/components/ui';

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
    <div className="flex rounded-md border">
      <div className="flex flex-1">
        <Input
          type="number"
          value={amount}
          onChange={intermediateOnAmountChange}
          className="ml-1 rounded-l-none border-0"
        />
      </div>
      <div className="flex items-center px-3 text-sm text-muted-foreground">
        USD
      </div>
    </div>
  );
}
