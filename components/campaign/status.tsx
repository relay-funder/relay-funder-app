import type { DbCampaign } from '@/types/campaign';
import { cn } from '@/lib/utils';
import { useCampaignStatus } from '@/hooks/use-campaign-status';

export function CampaignStatus({ campaign }: { campaign?: DbCampaign }) {
  const status = useCampaignStatus(campaign);
  return (
    <div
      className={cn('inline-block rounded-full px-3 py-1 text-sm', {
        // Light theme styles - using theme colors, fully opaque
        'border border-quantum bg-quantum text-white': status === 'Active',
        'border border-solar bg-solar text-white':
          status === 'Upcoming' || status === 'Pending Approval',
        'border border-gray-600 bg-gray-600 text-white':
          status === 'Ended' || status === 'Draft',
        'border border-red-600 bg-red-600 text-white': status === 'Failed',
        'border border-bio bg-bio text-white': status === 'Completed',
        'border border-gray-400 bg-gray-400 text-white': status === 'Disabled',
        // Dark theme styles for better contrast - using theme colors, fully opaque
        'dark:border-quantum dark:bg-quantum dark:text-white':
          status === 'Active',
        'dark:border-solar dark:bg-solar dark:text-white':
          status === 'Upcoming' || status === 'Pending Approval',
        'dark:border-gray-600 dark:bg-gray-600 dark:text-white':
          status === 'Ended' || status === 'Draft',
        'dark:border-red-600 dark:bg-red-600 dark:text-white':
          status === 'Failed',
        'dark:border-bio dark:bg-bio dark:text-white': status === 'Completed',
        'dark:border-gray-400 dark:bg-gray-400 dark:text-white':
          status === 'Disabled',
      })}
    >
      {status}
    </div>
  );
}
