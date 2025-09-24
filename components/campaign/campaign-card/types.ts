import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';

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
  // Round-specific actions
  onRoundApprove?: (
    campaign: DbCampaign,
    round: GetRoundResponseInstance,
  ) => Promise<void>;
  onRoundReject?: (
    campaign: DbCampaign,
    round: GetRoundResponseInstance,
  ) => Promise<void>;
  onRoundRemove?: (
    campaign: DbCampaign,
    round: GetRoundResponseInstance,
  ) => Promise<void>;
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
  showDescription?: boolean; // Show custom description prop (hidden by default)
  showCampaignDescription?: boolean; // Show campaign's built-in description (hidden by default)
  // Round-specific display options
  showRoundStatus?: boolean;
  showRoundAdminControls?: boolean;
  showRoundAdminFooterControls?: boolean; // Show round admin controls in footer instead of header
  showCampaignAdminActions?: boolean; // Show campaign-level admin actions (deploy, approve, etc.)
  showEssentialDetailsOnly?: boolean; // Show only essential details (for round context)
  dimNonApproved?: boolean; // Dim cards that aren't approved in round context
  layoutVariant?: 'standard' | 'minimal' | 'compact' | 'admin';
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
  type?: 'standard' | 'dashboard' | 'admin' | 'round' | 'round-minimal';

  /**
   * Whether this campaign is favorited by current user
   * Only relevant for dashboard type
   */
  isFavorite?: boolean;

  /**
   * Optional description to display on the card
   * When provided, overrides the campaign's default description
   * Hidden by default unless explicitly enabled
   */
  description?: string;

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

  // Round-specific props
  /**
   * Round context for round-specific features
   * Required when using round-related types
   */
  round?: GetRoundResponseInstance;

  /**
   * Custom status indicators to render
   * Can be used to inject round status badges
   */
  statusIndicators?: React.ReactNode;

  /**
   * Custom admin controls to render
   * Can be used to inject round-specific admin buttons
   */
  adminControls?: React.ReactNode;

  /**
   * Round admin controls to render in footer
   * Separate from header adminControls for better UX
   */
  roundAdminFooterControls?: React.ReactNode;

  /**
   * Selection handler for round campaign selection
   * Used in round-minimal variant
   */
  onSelect?: (campaign: DbCampaign) => Promise<void>;
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
  rounds?: Array<GetRoundResponseInstance>;
}

/**
 * Runtime validation for campaign card data
 * Ensures data conforms to expected schema
 */
export function validateCampaignCardData(
  campaign: unknown,
): campaign is CampaignCardData {
  if (!campaign || typeof campaign !== 'object') return false;

  const c = campaign as Record<string, unknown>;

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
  type: 'standard' | 'dashboard' | 'admin' | 'round' | 'round-minimal',
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
    showDescription: false, // Hidden by default - only show when explicitly enabled
    showCampaignDescription: false, // Hide campaign description by default
    // Round-specific defaults
    showRoundStatus: false,
    showRoundAdminControls: false,
    showRoundAdminFooterControls: false,
    showCampaignAdminActions: true, // Default to showing campaign admin actions
    showEssentialDetailsOnly: false,
    dimNonApproved: false,
    layoutVariant: 'standard',
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
        layoutVariant: 'admin',
      };

    case 'round':
      return {
        ...baseOptions,
        showStatusBadge: false, // Hide image-based campaign status to avoid duplication
        showRoundStatus: true,
        showRoundAdminControls: true, // Always show admin controls when user is admin
        showRoundAdminFooterControls: true, // Show round controls in footer
        showCampaignAdminActions: false, // Hide campaign admin actions in round view
        showEssentialDetailsOnly: true, // Show only essential details for round context
        showDates: true,
        dimNonApproved: false, // Remove default dimming
        openLinksInNewTab: true,
        layoutVariant: 'admin', // Use admin layout for better space utilization
      };

    case 'round-minimal':
      return {
        ...baseOptions,
        showRoundStatus: false,
        showCategoryBadge: true,
        showDates: true,
        truncateDescription: false,
        layoutVariant: 'minimal',
      };

    case 'standard':
    default:
      return {
        ...baseOptions,
        showRoundsIndicator: false, // Hide round indicators on homepage
        // Standard type now handles both regular and compact layouts
        // Use displayOptions to override for compact usage if needed
      };
  }
}
