import {
  Button,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CampaignDonationRelayFunder({
  onChange,
}: {
  onChange: (percent: number) => void;
}) {
  const [isDonatingToRelayFunder, setIsDonatingToRelayFunder] = useState(false);
  const [percentage, setPercentage] = useState(10);
  useEffect(() => {
    if (!isDonatingToRelayFunder) {
      onChange(0);
      return;
    }
    onChange(percentage);
  }, [percentage, isDonatingToRelayFunder, onChange]);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Switch
          checked={isDonatingToRelayFunder}
          onCheckedChange={setIsDonatingToRelayFunder}
        />
        <span className="text-sm">Donate to RelayFunder</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Choose a percentage to donate to RelayFunder (deducted before
                the amount is sent to the treasury)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {isDonatingToRelayFunder && (
        <div className="flex gap-2">
          {[5, 10, 15, 20].map((value) => (
            <Button
              key={value}
              variant={percentage === value ? 'default' : 'outline'}
              onClick={() => setPercentage(value)}
              className="flex-1"
            >
              {value}%
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
