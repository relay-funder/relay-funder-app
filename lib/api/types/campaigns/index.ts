import { DbCampaign } from '@/types/campaign';
import { DisplayUser, DisplayUserWithStates } from '../user';
import { TreasuryBalance } from '@/lib/treasury/interface';
export * from './comments';
export interface CampaignsWithIdParams {
  params: Promise<{
    campaignId: string;
  }>;
}
export interface CampaignsWithIdWithCommentWithIdParams {
  params: Promise<{
    campaignId: string;
    commentId: string;
  }>;
}
export interface PostCampaignsWithIdApproveBody {
  treasuryAddress?: string;
}
export interface PostCampaignsWithIdUpdatesBody {
  title?: string;
  content?: string;
}
export interface PostCampaignsRouteBody {
  campaignId: number;
  roundIds: number[];
}

export interface PaymentSummaryContribution {
  id: number;
  status: string;
  amount: number;
  token?: string | null;
  user?: DisplayUser;
  date?: Date;
  transactionHash?: `0x${string}`;
}
export interface GetCampaignPaymentSummary {
  token?: Record<
    string,
    {
      pending: number;
      confirmed: number;
    }
  >;
  lastConfirmed: PaymentSummaryContribution | null;
  lastPending: PaymentSummaryContribution | null;
  countConfirmed: number;
  countPending: number;
}
export interface GetCampaignResponseInstance extends DbCampaign {
  creator: DisplayUserWithStates;
  paymentSummary: GetCampaignPaymentSummary;
  treasuryBalance?: TreasuryBalance | null;
}
export interface GetCampaignResponse {
  campaign: GetCampaignResponseInstance;
}
export interface GetCampaignPaymentsResponse {
  payments: PaymentSummaryContribution[];
}
export interface PostCampaignsResponse {
  campaignId: number;
}
export interface PatchCampaignResponse extends GetCampaignResponse {}
export interface PostCampaignApproveResponse extends GetCampaignResponse {}
export interface GetCampaignsStatsResponse {
  totalCampaigns: number;
  totalRaised: number;
  activeCampaigns: number;
  averageProgress: number;
}
export interface PatchUserCampaignResponse extends GetCampaignResponse {}
