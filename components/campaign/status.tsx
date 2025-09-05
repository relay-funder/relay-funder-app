import type { DbCampaign } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { useCampaignStatus } from '@/hooks/use-campaign-status';

export function CampaignStatus({ campaign }: { campaign?: DbCampaign }) {
  const status = useCampaignStatus(campaign);
  return (
    <div
      className={cn('inline-block rounded-full px-3 py-1 text-sm', {
        'bg-blue-100 text-blue-600': status === 'Active',
        'bg-yellow-100 text-yellow-600': status === 'Upcoming',
        'bg-gray-100 text-gray-600': status === 'Ended',
        'bg-orange-100 text-orange-600': status === 'Pending Approval',
        'bg-purple-100 text-purple-600': status === 'Draft',
        'bg-red-100 text-red-600': status === 'Failed',
        'bg-green-100 text-green-600': status === 'Completed',
      })}
    >
      {status}
    </div>
  );
}
