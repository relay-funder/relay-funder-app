import { DbCampaign } from '@/types/campaign';

/**
 * Campaign Card Action Handlers
 * Defines callback functions for various card actions
 */
export interface CampaignCardActions {
  onEdit?: (campaign: DbCampaign) => Promise<void>;
  onDelete?: (campaign: DbCampaign) => Promise<void>;
  onTogglePublish?: (campaign: DbCampaign) => Promise<void>;
  onApprove?: (campaign: DbCampaign) => Promise<void>;
  onDisable?: (campaign: DbCampaign) => Promise<void>;
  onFavoriteToggle?: (isFavorite: boolean) => Promise<void>;
  onCreate?: () => Promise<void>;
  onSelect?: (campaign: DbCampaign) => Promise<void>;
}

/**
 * Campaign Card Display Options
 * Controls which UI elements are shown or hidden
 */
export interface CampaignCardDisplayOptions {
  showFavoriteButton?: boolean;
  showRemoveButton?: boolean;
  showStatusBadge?: boolean;
  showCategoryBadge?: boolean;
  showDates?: boolean;
  showRoundsIndicator?: boolean;
  showTreasuryBalance?: boolean;
  showContractAddresses?: boolean;
  showDonateButton?: boolean;
  showStatusBasedButton?: boolean;
  truncateDescription?: boolean;
  useCardImage?: boolean; // Use CampaignMainImageCard instead of CampaignMainImage
  openLinksInNewTab?: boolean;
}

/**
 * Simplified Campaign Card Props Interface
 * Focuses on essential configuration for different use cases
 */
export interface CampaignCardProps {
  /**
   * Campaign data - must conform to DbCampaign structure
   * When undefined, shows fallback state
   */
  campaign?: DbCampaign;

  /**
   * Card type - determines default display options and behaviors
   * @default 'standard'
   */
  type?: 'standard' | 'dashboard' | 'admin' | 'compact';

  /**
   * Whether this campaign is favorited by current user
   * Only relevant for dashboard type
   */
  isFavorite?: boolean;

  /**
   * Action handlers for card interactions
   */
  actionHandlers?: CampaignCardActions;

  /**
   * Override default display options for fine-grained control
   */
  displayOptions?: Partial<CampaignCardDisplayOptions>;

  /**
   * Custom buttons to render instead of default actions
   */
  customButtons?: React.ReactNode;

  /**
   * Disable all action buttons
   */
  disabled?: boolean;

  /**
   * Custom className for additional styling
   */
  className?: string;

  /**
   * Custom content to render in card content area
   */
  children?: React.ReactNode;
}

/**
 * Shared Campaign Card Data Schema
 * Documents the required data points that all campaign cards must have
 */
export interface CampaignCardData {
  // Core identification
  id: number;
  title: string;
  description: string;
  slug: string;

  // Campaign lifecycle
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  startTime: Date;
  endTime: Date;
  createdAt: Date;

  // Creator information
  creatorAddress: string;
  creator?: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };

  // Financial data
  fundingGoal: string;
  paymentSummary?: {
    totalPaid: string;
    totalPaidUsd: string;
    contributorCount: number;
    donationCount: number;
  };

  // Media and content
  images?: Array<{
    id: number;
    imageUrl: string | File;
    isMainImage: boolean;
  }>;

  // Optional metadata
  location?: string | null;
  category?: string | null;
  treasuryAddress?: string | null;
  campaignAddress?: string | null;
  rounds?: Array<any>;
}

/**
 * Runtime validation for campaign card data
 * Ensures data conforms to expected schema
 */
export function validateCampaignCardData(
  campaign: unknown,
): campaign is CampaignCardData {
  if (!campaign || typeof campaign !== 'object') return false;

  const c = campaign as any;

  // Required fields validation
  return (
    typeof c.id === 'number' &&
    typeof c.title === 'string' &&
    typeof c.description === 'string' &&
    typeof c.slug === 'string' &&
    typeof c.status === 'string' &&
    c.startTime instanceof Date &&
    c.endTime instanceof Date &&
    typeof c.creatorAddress === 'string' &&
    typeof c.fundingGoal === 'string'
  );
}

/**
 * Default display options for different card types
 */
export function getDefaultDisplayOptions(
  type: 'standard' | 'dashboard' | 'admin' | 'compact',
): CampaignCardDisplayOptions {
  const baseOptions: CampaignCardDisplayOptions = {
    showFavoriteButton: false,
    showRemoveButton: false,
    showStatusBadge: true,
    showCategoryBadge: true,
    showDates: false,
    showRoundsIndicator: false,
    showTreasuryBalance: false,
    showContractAddresses: false,
    showDonateButton: false, // Removed since whole card is clickable
    showStatusBasedButton: false, // Simplified design
    truncateDescription: true,
    useCardImage: false,
    openLinksInNewTab: false,
  };

  switch (type) {
    case 'dashboard':
      return {
        ...baseOptions,
        showFavoriteButton: true,
        showRemoveButton: true,
        showRoundsIndicator: true,
      };

    case 'admin':
      return {
        ...baseOptions,
        showDates: true,
        showTreasuryBalance: true,
        showContractAddresses: true,
        truncateDescription: false,
        openLinksInNewTab: true,
      };

    case 'compact':
      return {
        ...baseOptions,
        useCardImage: true,
        showRoundsIndicator: true,
        showCategoryBadge: false,
      };

    case 'standard':
    default:
      return {
        ...baseOptions,
        showRoundsIndicator: true,
      };
  }
}
