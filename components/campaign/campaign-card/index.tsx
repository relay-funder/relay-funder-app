import React from 'react';

// Main component export
export { CampaignCard } from './main';

// Note: Round variants have been integrated directly into the unified CampaignCard component.
// Use CampaignCard with type="round", type="round-admin", or type="round-minimal" instead.

// Type exports
export type {
  CampaignCardProps,
  CampaignCardActions,
  CampaignCardDisplayOptions,
  CampaignCardData,
} from './types';

// Utility exports
export { validateCampaignCardData, getDefaultDisplayOptions } from './types';

// Convenience components for backwards compatibility
import { CampaignCard } from './main';
import { CampaignCardProps } from './types';

export const CampaignCardStandard = (
  props: Omit<CampaignCardProps, 'type'>,
) => <CampaignCard {...props} type="standard" />;

export const CampaignCardDashboard = (
  props: Omit<CampaignCardProps, 'type'>,
) => <CampaignCard {...props} type="dashboard" />;

export const CampaignCardAdmin = (props: Omit<CampaignCardProps, 'type'>) => (
  <CampaignCard {...props} type="admin" />
);

export const CampaignCardItem = (props: Omit<CampaignCardProps, 'type'>) => (
  <CampaignCard {...props} type="compact" />
);

// Legacy fallback - consider using CreateCampaignPlaceholder for create actions
export const CampaignCardFallback = (props: CampaignCardProps) => (
  <CampaignCard {...props} campaign={undefined} />
);
