import { z } from 'zod';

// Daimo Pay webhook payload schema based on official documentation
// https://docs.daimo.com/webhooks
const BaseWebhookPayloadSchema = z.object({
  type: z.enum([
    'payment_started',
    'payment_completed',
    'payment_bounced',
    'payment_refunded',
  ]),
  paymentId: z.string(),
  chainId: z.number(),
  txHash: z.string(),
  payment: z.object({
    id: z.string(),
    status: z.enum([
      'payment_started',
      'payment_completed',
      'payment_bounced',
      'payment_refunded',
    ]),
    createdAt: z.string().optional(),
    display: z
      .object({
        intent: z.string().optional(),
        paymentValue: z.string().optional(),
        currency: z.string().optional(),
      })
      .optional(),
    source: z
      .object({
        payerAddress: z.string().optional(),
        txHash: z.string().optional(),
        chainId: z.string().optional(),
        amountUnits: z.string().optional(),
        tokenSymbol: z.string().optional(),
        tokenAddress: z.string().optional(),
      })
      .optional(),
    destination: z
      .object({
        destinationAddress: z.string().optional(),
        txHash: z.string().nullable().optional(),
        chainId: z.string().optional(),
        amountUnits: z.string().optional(),
        tokenSymbol: z.string().optional(),
        tokenAddress: z.string().optional(),
        calldata: z.string().optional(),
      })
      .optional(),
    externalId: z.string().nullable().optional(),
    metadata: z
      .object({
        campaignId: z.string().optional(),
        treasuryAddress: z.string().optional(),
        email: z.string().optional(),
        anonymous: z.string().optional(),
        tipAmount: z.string().optional(),
        baseAmount: z.string().optional(),
      })
      .optional()
      .nullable(),
  }),
  isTestEvent: z.boolean().optional(),
});

// Extended schema for payment_refunded events
const RefundedWebhookPayloadSchema = BaseWebhookPayloadSchema.extend({
  type: z.literal('payment_refunded'),
  refundAddress: z.string(),
  tokenAddress: z.string(),
  amountUnits: z.string(),
});

// Union type to handle all webhook event types
export const DaimoPayWebhookPayloadSchema = z.union([
  RefundedWebhookPayloadSchema,
  BaseWebhookPayloadSchema,
]);

export type DaimoPayWebhookPayload = z.infer<
  typeof DaimoPayWebhookPayloadSchema
>;
