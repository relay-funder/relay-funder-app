
// Main component export
export { CampaignCard } from './main';

// Note: Round variants have been integrated directly into the unified CampaignCard component.
// Use CampaignCard with type="round" or type="round-minimal" instead.

// Type exports
export type {
  CampaignCardProps,
  CampaignCardActions,
  CampaignCardDisplayOptions,
  CampaignCardData,
} from './types';

// Utility exports
export { validateCampaignCardData, getDefaultDisplayOptions } from './types';
