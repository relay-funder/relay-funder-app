import type { DbCampaign } from '@/types/campaign';

export function useCampaignStatus(campaign?: DbCampaign) {
  if (!campaign) {
    return 'Draft';
  }
  if (campaign.status === 'DRAFT') {
    return 'Draft';
  } else if (campaign.status === 'PENDING_APPROVAL') {
    return 'Pending Approval';
  } else if (campaign.status === 'DISABLED') {
    return 'Disabled';
  } else if (campaign.status === 'FAILED') {
    return 'Failed';
  } else if (campaign.status === 'COMPLETED') {
    return 'Completed';
  }
  const launchTime = new Date(campaign.startTime ?? Date.now()).getTime();
  const deadline = new Date(campaign.endTime ?? Date.now()).getTime();
  if (Date.now() < launchTime) {
    return 'Upcoming';
  } else if (Date.now() > deadline) {
    return 'Ended';
  }
  return 'Active';
}
