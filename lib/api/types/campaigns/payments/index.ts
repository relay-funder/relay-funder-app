import { z } from 'zod';
import { PaymentSummaryContribution } from '..';

export interface GetCampaignPaymentResponseInstance
  extends PaymentSummaryContribution {}
export interface GetCampaignPaymentResponse {
  payment: GetCampaignPaymentResponseInstance;
}
export const PostPaymentBodyRouteSchema = z.object({
  amount: z.string(),
  token: z.string(),
  isAnonymous: z.boolean(),
  type: z.enum(['SELL', 'BUY']),
  status: z.enum(['confirming']),
  transactionHash: z.string(),
  campaignId: z.number(),
});
export const PatchPaymentBodyRouteSchema = z.object({
  paymentId: z.number(),
  status: z.enum(['confirmed', 'failed']),
  transactionHash: z.string(),
});
