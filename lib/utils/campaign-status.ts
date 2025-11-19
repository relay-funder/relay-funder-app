import type { DbCampaign } from '@/types/campaign';

export function getStatusVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'PENDING_APPROVAL':
      return 'secondary';
    case 'DRAFT':
      return 'outline';
    case 'COMPLETED':
      return 'secondary';
    case 'DISABLED':
    case 'FAILED':
    case 'CANCELLED':
    case 'PAUSED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'Pending Approval';
    case 'ACTIVE':
      return 'Active';
    case 'DRAFT':
      return 'Draft';
    case 'COMPLETED':
      return 'Completed';
    case 'DISABLED':
      return 'Disabled';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'PAUSED':
      return 'Paused';
    default:
      return status;
  }
}

export function isCampaignStarted(campaign: DbCampaign): boolean {
  const now = new Date();
  return now >= campaign.startTime;
}

export function isCampaignDonatable(campaign: DbCampaign): boolean {
  const now = new Date();
  return (
    campaign.status === 'ACTIVE' &&
    now >= campaign.startTime &&
    now <= campaign.endTime
  );
}

export function getCampaignStatusInfo(campaign: DbCampaign) {
  const now = new Date();
  const isActive = campaign.status === 'ACTIVE';
  const hasStarted = now >= campaign.startTime;
  const hasEnded = now > campaign.endTime;
  const canDonate = isActive && hasStarted && !hasEnded;

  let status: string;
  let description: string;
  let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'outline';

  if (!hasStarted) {
    status = 'Not Started';
    description = 'Campaign has not started yet';
    variant = 'outline';
  } else if (hasEnded && isActive) {
    status = 'Ended';
    description = 'Campaign has ended';
    variant = 'secondary';
  } else if (isActive && canDonate) {
    status = 'Active';
    description = 'Accepting donations';
    variant = 'default';
  } else if (campaign.status === 'COMPLETED') {
    status = 'Completed';
    description = 'Campaign successfully completed';
    variant = 'secondary';
  } else if (campaign.status === 'PENDING_APPROVAL') {
    status = 'Pending Approval';
    description = 'Waiting for approval';
    variant = 'secondary';
  } else if (campaign.status === 'DRAFT') {
    status = 'Draft';
    description = 'Campaign is in draft mode';
    variant = 'outline';
  } else {
    status = campaign.status;
    description = 'Campaign status unknown';
    variant = 'destructive';
  }

  return {
    status,
    variant,
    description,
    canDonate,
  };
}

export function isCampaignFeatured(campaign: DbCampaign): boolean {
  if (!campaign.featuredStart || !campaign.featuredEnd) {
    return false;
  }

  const now = new Date();
  return now >= campaign.featuredStart && now <= campaign.featuredEnd;
}

export function transformStartTime(startTime: string | Date): string {
  if (typeof startTime === 'string') {
    return startTime;
  }
  return startTime.toISOString();
}

export function transformEndTime(endTime: string | Date): string {
  if (typeof endTime === 'string') {
    return endTime;
  }
  return endTime.toISOString();
}
