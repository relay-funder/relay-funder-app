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
  type: z.enum(['SELL', 'BUY']).optional().default('BUY'),
  status: z.enum(['confirming']),
  transactionHash: z.string(),
  campaignId: z.number(),
  userEmail: z.string().email().optional(),
  poolAmount: z.number().optional(),
  provider: z.string().optional(),
});
export const PatchPaymentBodyRouteSchema = z.object({
  paymentId: z.number(),
  status: z.enum(['confirmed', 'failed']),
  transactionHash: z.string().optional(),
});
