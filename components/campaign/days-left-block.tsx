import { Clock } from 'lucide-react';
import { DbCampaign } from '@/types/campaign';
import { CampaignDaysLeft } from './days-left';
import { cn } from '@/lib/utils';
export function CampaignDaysLeftBlock({
  campaign,
  className,
}: {
  campaign: DbCampaign;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-500" />
        <span className="text-2xl font-bold">
          <CampaignDaysLeft campaign={campaign} />
        </span>
      </div>
      <p className="text-sm text-gray-600">days left</p>
    </div>
  );
}
