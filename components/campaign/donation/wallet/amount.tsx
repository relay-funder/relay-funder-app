import { useCallback, type ChangeEvent } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
} from '@/components/ui';
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
    <div className="flex flex-col space-y-4">
      {/* Suggested amounts */}
      <CampaignDonationSuggestions
        amount={amount}
        onAmountChanged={onAmountChanged}
        currency={selectedToken}
      />

      {/* Custom amount input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Or enter a custom amount:
        </label>
        <div className="flex rounded-md border shadow-sm">
          <Select value={selectedToken} onValueChange={onTokenChanged}>
            <SelectTrigger className="w-[120px] rounded-r-none border-0 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedTokenList.map((supportedToken: string) => (
                <SelectItem value={supportedToken} key={supportedToken}>
                  {supportedToken}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={amount}
            onChange={intermediateOnAmountChange}
            className="ml-1 flex-1 rounded-l-none border-0 border-l"
          />
          <div className="flex items-center px-3 text-sm text-muted-foreground">
            {formatCrypto(numericAmount, selectedToken)}
          </div>
        </div>
      </div>
    </div>
  );
}
