import { DbCampaign } from '@/types/campaign';
import { DisplayUser, DisplayUserWithStates } from '../user';

export interface CampaignsWithIdParams {
  params: Promise<{
    campaignId: string;
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
}
export interface GetCampaignResponse {
  campaign: GetCampaignResponseInstance;
}
export interface GetCampaignPaymentsResponse {
  payments: PaymentSummaryContribution[];
}
