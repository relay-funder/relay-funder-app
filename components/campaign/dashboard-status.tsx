import { cn } from '@/lib/utils';
import { type DbCampaign } from '@/types/campaign';

function getCampaignStatus(campaign: DbCampaign) {
  if (campaign.status === 'DRAFT') return 'Draft';
  if (campaign.status === 'PENDING_APPROVAL') return 'Pending Approval';
  if (campaign.status === 'FAILED') return 'Failed';
  if (campaign.status === 'COMPLETED') return 'Completed';

  const now = Math.floor(Date.now() / 1000);
  const launchTime = new Date(campaign.startTime ?? Date.now()).getTime();
  const deadline = new Date(campaign.endTime ?? Date.now()).getTime();

  if (now < launchTime) return 'Upcoming';
  if (now > deadline) return 'Ended';
  return 'Active';
}

export function CampaignDashboardStatus({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  return (
    <div
      className={cn('inline-block rounded-full px-3 py-1 text-xs md:text-sm', {
        'bg-blue-100 text-blue-600': getCampaignStatus(campaign) === 'Active',
        'bg-yellow-100 text-yellow-600':
          getCampaignStatus(campaign) === 'Upcoming',
        'bg-gray-100 text-gray-600': getCampaignStatus(campaign) === 'Ended',
        'bg-orange-100 text-orange-600':
          getCampaignStatus(campaign) === 'Pending Approval',
        'bg-purple-100 text-purple-600':
          getCampaignStatus(campaign) === 'Draft',
        'bg-red-100 text-red-600': getCampaignStatus(campaign) === 'Failed',
        'bg-green-100 text-green-600':
          getCampaignStatus(campaign) === 'Completed',
      })}
    >
      {getCampaignStatus(campaign)}
    </div>
  );
}
