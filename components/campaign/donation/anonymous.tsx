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
      <div className="mb-2 flex items-center gap-2">
        <Switch checked={anonymous} onCheckedChange={onChange} id="anonymous" />
        <span className="text-sm">Make my donation anonymous</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                By checking this, we won&apos;t consider your profile
                information as a donor for this donation and won&apos;t show it
                on public pages.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
