import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ChangeEvent,
} from 'react';
import { Input, Label } from '@/components/ui';
import { Info } from 'lucide-react';
import { useDonationContext } from '@/contexts';

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 50;
const DEFAULT_PERCENTAGE = 5;

export function CampaignDonationWalletTip() {
  const { amount, tipAmount, setTipAmount, token, paymentType } =
    useDonationContext();
  const [percentage, setPercentage] = useState(DEFAULT_PERCENTAGE);
  const [displayPercentage, setDisplayPercentage] =
    useState(DEFAULT_PERCENTAGE);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced effect for tip calculation
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced calculation
    debounceTimeoutRef.current = setTimeout(() => {
      const tip = (percentage / 100) * parseFloat(amount || '0');
      const formattedTip = tip.toFixed(2);
      setTipAmount(formattedTip);
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [percentage, amount, setTipAmount]); // Include all dependencies

  const handlePercentageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newPercentage = Number(event.target.value);
      setDisplayPercentage(newPercentage); // Update display immediately
      setPercentage(newPercentage); // This will trigger debounced calculation
    },
    [],
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
        Add a tip (optional)
        <Info className="h-4 w-4 text-muted-foreground" />
      </Label>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Label className="text-sm text-muted-foreground">Percentage:</Label>
          <input
            type="range"
            min={MIN_PERCENTAGE}
            max={MAX_PERCENTAGE}
            value={displayPercentage}
            onChange={handlePercentageChange}
            className="flex-1 accent-quantum dark:accent-quantum"
          />
          <span className="text-sm font-medium text-foreground">
            {displayPercentage}%
          </span>
        </div>
        <div className="max-w-sm">
          <div className="relative">
            <Input
              type="text"
              value={tipAmount}
              readOnly
              placeholder="Tip calculated from percentage"
              className="h-10 cursor-not-allowed bg-muted pr-20 text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {paymentType === 'daimo' ? 'USD' : token}
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Tips support the platform and go directly to platform administrators.
      </p>
    </div>
  );
}
