import { CampaignStatus } from '@/types/campaign';
import { DbCampaign } from '@/types/campaign';

/**
 * Check if a campaign is active and can accept donations
 */
export function isCampaignActive(campaign?: DbCampaign): boolean {
  if (!campaign) return false;
  return campaign.status === CampaignStatus.ACTIVE;
}

/**
 * Check if a campaign is donatable (active + has transaction hash)
 */
export function isCampaignDonatable(campaign?: DbCampaign): boolean {
  if (!campaign) return false;
  return (
    campaign.status === CampaignStatus.ACTIVE &&
    campaign.transactionHash !== null
  );
}

/**
 * Check if a campaign is currently featured
 */
export function isCampaignFeatured(campaign?: DbCampaign): boolean {
  if (!campaign) {
    return false;
  }
  const now = new Date();
  return (
    (campaign.featuredStart &&
      new Date(campaign.featuredStart) <= now &&
      (!campaign.featuredEnd || new Date(campaign.featuredEnd) >= now)) ||
    false
  );
}

/**
 * Get campaign status display info
 */
export function getCampaignStatusInfo(campaign?: DbCampaign) {
  if (!campaign) {
    return {
      status: 'Unknown',
      variant: 'secondary' as const,
      description: 'Campaign not found',
      canDonate: false,
    };
  }

  switch (campaign.status) {
    case CampaignStatus.ACTIVE:
      return {
        status: 'Active',
        variant: 'default' as const,
        description: 'Campaign is live and accepting donations',
        canDonate: campaign.transactionHash !== null,
      };
    case CampaignStatus.DRAFT:
      return {
        status: 'Draft',
        variant: 'secondary' as const,
        description: 'Campaign is being prepared',
        canDonate: false,
      };
    case CampaignStatus.PENDING_APPROVAL:
      return {
        status: 'Pending Approval',
        variant: 'outline' as const,
        description: 'Campaign is awaiting admin approval',
        canDonate: false,
      };
    case CampaignStatus.COMPLETED:
      return {
        status: 'Completed',
        variant: 'secondary' as const,
        description: 'Campaign has reached its goal',
        canDonate: false,
      };
    case CampaignStatus.FAILED:
      return {
        status: 'Failed',
        variant: 'destructive' as const,
        description: 'Campaign was unsuccessful',
        canDonate: false,
      };
    default:
      return {
        status: 'Unknown',
        variant: 'secondary' as const,
        description: 'Campaign status unknown',
        canDonate: false,
      };
  }
}
