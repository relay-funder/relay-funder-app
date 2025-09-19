/**
 * Re-export from the new modular campaign card structure
 * This maintains backward compatibility while the component is now
 * split into separate, manageable files in ./campaign-card/ folder
 */
export {
  CampaignCard,
  CampaignCardStandard,
  CampaignCardDashboard,
  CampaignCardAdmin,
  CampaignCardItem,
  CampaignCardFallback,
} from './campaign-card/index';

// Modern create campaign placeholder
export { CreateCampaignPlaceholder } from './create-campaign-placeholder';

// Enhanced round display component
export { CampaignRoundBadge } from './round-badge';

export type {
  CampaignCardProps,
  CampaignCardActions,
  CampaignCardDisplayOptions,
  CampaignCardData,
} from './campaign-card/index';
