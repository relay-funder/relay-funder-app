import { PaymentSummaryContribution } from '..';

export interface GetCampaignPaymentResponseInstance
  extends PaymentSummaryContribution {}
export interface GetCampaignPaymentResponse {
  payment: GetCampaignPaymentResponseInstance;
}
