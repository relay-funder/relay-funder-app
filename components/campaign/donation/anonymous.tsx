import {
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { HelpCircle } from 'lucide-react';

export function CampaignDonationAnonymous({
  anonymous,
  onChange,
}: {
  anonymous: boolean;
  onChange: (newState: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">
        Privacy Settings
      </label>
      <div className="flex items-center gap-2">
        <Switch checked={anonymous} onCheckedChange={onChange} id="anonymous" />
        <span className="text-sm text-gray-700">
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
