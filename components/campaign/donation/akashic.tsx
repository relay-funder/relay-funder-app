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

export function CampaignDonationAkashic({
  onChange,
}: {
  onChange: (percent: number) => void;
}) {
  const [isDonatingToAkashic, setIsDonatingToAkashic] = useState(false);
  const [percentage, setPercentage] = useState(10);
  useEffect(() => {
    if (!isDonatingToAkashic) {
      onChange(0);
      return;
    }
    onChange(percentage);
  }, [percentage, isDonatingToAkashic, onChange]);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Switch
          checked={isDonatingToAkashic}
          onCheckedChange={setIsDonatingToAkashic}
        />
        <span className="text-sm">Donate to Akashic</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Choose a percentage to donate to Akashic (deducted before the
                amount is sent to the treasury)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {isDonatingToAkashic && (
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
