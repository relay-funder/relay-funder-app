import type { Prisma } from '@/.generated/prisma/client';

/**
  Types for the Admin User Overview aggregate response.
  This mirrors the data needed by the Admin User Detail page:
  - Base user with counts
  - Latest related entities (payments, payment methods, media, withdrawals, approvals, comments, favorites, round contributions)
  - Totals for comments, favorites, and round contributions
*/

/**
 * Base user payload with relation counts.
 */
export type AdminUserOverviewUser = Prisma.UserGetPayload<{
  include: {
    _count: true;
  };
}>;

/**
 * Lightweight campaign shape used across relations.
 */
export type CampaignLite = Prisma.CampaignGetPayload<{
  select: { id: true; title: true; slug: true };
}>;

/**
 * Campaign with status and key metadata for user overview.
 */
export type UserCampaign = Prisma.CampaignGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    status: true;
    createdAt: true;
    startTime: true;
    endTime: true;
  };
}>;

/**
 * Payment with campaign metadata (compact).
 */
export type PaymentWithCampaignLite = Prisma.PaymentGetPayload<{
  include: {
    campaign: {
      select: { id: true; title: true; slug: true };
    };
  };
}>;

/**
 * Media with selected fields (compact).
 */
export type MediaLite = Prisma.MediaGetPayload<{
  select: {
    id: true;
    url: true;
    caption: true;
    mimeType: true;
    state: true;
    createdAt: true;
    campaignId: true;
    roundId: true;
    updateId: true;
  };
}>;

/**
 * Withdrawal with campaign metadata (used for both created and approved lists).
 */
export type WithdrawalWithCampaignLite = Prisma.WithdrawalGetPayload<{
  include: {
    campaign: {
      select: { id: true; title: true; slug: true };
    };
  };
}>;

/**
 * Comment with campaign metadata.
 */
export type CommentWithCampaignLite = Prisma.CommentGetPayload<{
  include: {
    campaign: {
      select: { id: true; title: true; slug: true };
    };
  };
}>;

/**
 * Favorite with campaign metadata.
 */
export type FavoriteWithCampaignLite = Prisma.FavoriteGetPayload<{
  include: {
    campaign: {
      select: { id: true; title: true; slug: true };
    };
  };
}>;

/**
 * RoundContribution with related Round and Campaign (via roundCampaign),
 * plus the payment amount/token.
 */
export type RoundContributionLite = Prisma.RoundContributionGetPayload<{
  include: {
    roundCampaign: {
      include: {
        Round: { select: { id: true; title: true; status: true } };
        Campaign: { select: { id: true; title: true; slug: true } };
      };
    };
    payment: { select: { amount: true; token: true } };
  };
}>;

/**
 * Aggregate response for the admin user overview endpoint.
 */
export interface AdminUserOverviewResponse {
  user: AdminUserOverviewUser;

  latestPayments: PaymentWithCampaignLite[];
  latestPaymentMethods: Prisma.PaymentMethodGetPayload<null>[];
  latestMedia: MediaLite[];
  latestWithdrawalsCreated: WithdrawalWithCampaignLite[];
  latestApprovals: WithdrawalWithCampaignLite[];
  latestComments: CommentWithCampaignLite[];
  latestFavorites: FavoriteWithCampaignLite[];
  latestRoundContributions: RoundContributionLite[];

  totalComments: number;
  totalFavorites: number;
  totalRoundContributions: number;

  userCampaigns: UserCampaign[];
}
