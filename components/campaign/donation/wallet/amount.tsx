import { useCallback, type ChangeEvent } from 'react';
import { Input } from '@/components/ui';
import { formatCrypto } from '@/lib/format-crypto';
import { CampaignDonationSuggestions } from '../suggestions';

const supportedTokenList = ['USDC'];

export function CampaignDonationWalletAmount({
  amount,
  selectedToken,
  onAmountChanged,
  onTokenChanged,
}: {
  amount: string;
  selectedToken: string;
  onAmountChanged: (amount: string) => void;
  onTokenChanged: (token: string) => void;
}) {
  const intermediateOnAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      return onAmountChanged(event.target.value);
    },
    [onAmountChanged],
  );
  const numericAmount = parseFloat(amount) || 0;

  return (
    <div className="flex flex-col space-y-5">
      {/* Suggested amounts */}
      <CampaignDonationSuggestions
        amount={amount}
        onAmountChanged={onAmountChanged}
        currency={selectedToken}
      />

      {/* Custom amount input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">
          Or enter a custom amount:
        </label>
        <div className="max-w-sm">
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={intermediateOnAmountChange}
              placeholder="Enter amount"
              className="h-10 pr-20 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              USDC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
