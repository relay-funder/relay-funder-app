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
    <div className="flex rounded-md border shadow-sm">
      <div className="relative flex flex-1">
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
          className="ml-1 rounded-l-none border-0 border-l"
        />
      </div>
      <div className="flex items-center px-3 text-sm text-muted-foreground">
        {formatCrypto(numericAmount, selectedToken)}
      </div>
    </div>
  );
}
