import { CampaignStatus } from '@/types/campaign';
import { DbCampaign } from '@/types/campaign';
import {
  parseISO,
  isValid,
  addMinutes,
  startOfDay,
  endOfDay,
  formatISO,
  addDays,
} from 'date-fns';

/**
 * Check if a campaign is active and can accept donations
 */
export function isCampaignActive(campaign?: DbCampaign): boolean {
  if (!campaign) return false;
  return campaign.status === CampaignStatus.ACTIVE;
}

/**
 * Check if a campaign has started based on start time
 */
export function isCampaignStarted(campaign?: DbCampaign): boolean {
  if (!campaign) return false;
  return new Date(campaign.startTime).getTime() <= Date.now();
}

/**
 * Check if a campaign is donatable (active + has transaction hash + has started)
 */
export function isCampaignDonatable(campaign?: DbCampaign): boolean {
  if (!campaign) return false;
  return (
    campaign.status === CampaignStatus.ACTIVE &&
    campaign.transactionHash !== null &&
    isCampaignStarted(campaign)
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
    case CampaignStatus.DISABLED:
      return {
        status: 'Disabled',
        variant: 'outline' as const,
        description: 'Campaign has been temporarily disabled by the owner',
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

/**
 * Time transformation utilities for campaign forms
 */

/**
 * Transforms a date string to a proper ISO timestamp for campaign start time.
 * Handles YYYY-MM-DD format and converts to appropriate future time.
 */
export function transformStartTime(value: string): string {
  // Handle empty or invalid values gracefully
  if (!value || typeof value !== 'string' || value.trim() === '') {
    // Return a default future date if value is invalid
    return formatISO(addDays(new Date(), 1)); // Tomorrow
  }

  try {
    // If value is already an ISO string (already transformed), return it as-is
    if (value.includes('T') && value.includes('Z')) {
      return value;
    }

    // Parse YYYY-MM-DD format
    const parsedDate = parseISO(value + 'T00:00:00');

    // Check if the date is valid
    if (!isValid(parsedDate)) {
      // Invalid date, return default
      return formatISO(addDays(new Date(), 1)); // Tomorrow
    }

    const now = new Date();

    // If selected date is today, set to 1 hour from now
    // If selected date is in the future, set to start of day
    const isToday = parsedDate.toDateString() === now.toDateString();

    if (isToday) {
      // Today: set to 1 hour from now
      return formatISO(addMinutes(now, 60));
    } else {
      // Future date: set to start of day in UTC
      return formatISO(startOfDay(parsedDate));
    }
  } catch (error) {
    // If any error occurs, return a safe default
    console.warn('Error in transformStartTime, using default:', error);
    return formatISO(addDays(new Date(), 1)); // Tomorrow
  }
}

/**
 * Transforms a date string to a proper ISO timestamp for campaign end time.
 * Handles YYYY-MM-DD format and sets time to end of the selected day.
 */
export function transformEndTime(value: string): string {
  // Handle empty or invalid values gracefully
  if (!value || typeof value !== 'string' || value.trim() === '') {
    // Return a default future end date if value is invalid
    return formatISO(addDays(new Date(), 7)); // 7 days from now
  }

  try {
    // If value is already an ISO string (already transformed), return it as-is
    if (value.includes('T') && value.includes('Z')) {
      return value;
    }

    // Parse YYYY-MM-DD format
    const parsedDate = parseISO(value + 'T00:00:00');

    // Check if the date is valid
    if (!isValid(parsedDate)) {
      // Invalid date, return default
      return formatISO(addDays(new Date(), 7)); // 7 days from now
    }

    // Set end time to end of the selected day
    return formatISO(endOfDay(parsedDate));
  } catch (error) {
    // If any error occurs, return a safe default
    console.warn('Error in transformEndTime, using default:', error);
    return formatISO(addDays(new Date(), 7)); // 7 days from now
  }
}
