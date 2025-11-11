import {
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { useDonationContext } from '@/contexts';
import { HelpCircle } from 'lucide-react';

export function CampaignDonationAnonymous() {
  const { isAnonymous, setIsAnonymous } = useDonationContext();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Privacy Settings
      </label>
      <div className="flex items-center gap-2">
        <Switch
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
          id="anonymous"
          className="dark:data-[state=checked]:bg-quantum dark:data-[state=unchecked]:bg-muted"
        />
        <span className="text-sm text-muted-foreground">
          Make my contribution anonymous
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                By checking this, we won&apos;t consider your profile
                information as a contributor for this contribution and
                won&apos;t show it on public pages.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
