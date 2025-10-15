/**
 * User score points constants for different event types and user roles.
 * These values ensure consistency between getUserScoreEvents and calculateUserScore functions.
 */

// Points awarded when user creates an event (donor actions)
export const CREATOR_EVENT_POINTS = {
  CampaignComment: 1,
  CampaignPayment: 5,
  ProfileCompleted: 2,
  CampaignUpdate: 3,
} as const;

// Points awarded when user receives an event (creator rewards)
export const RECEIVER_EVENT_POINTS = {
  CampaignApprove: 10,
  CampaignDisable: -5,
  CampaignComment: 1,
  CampaignPayment: 1,
  CampaignUpdate: 0,
  CampaignShare: 2, // Simplified: single score for all share events
} as const;
