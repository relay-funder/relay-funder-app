import { z } from 'zod';

// Daimo Pay webhook payload schema based on official documentation
export const DaimoPayWebhookPayloadSchema = z
  .object({
    type: z.enum([
      'payment_started',
      'payment_completed',
      'payment_bounced',
      'payment_refunded',
    ]),
    paymentId: z.string(),
    payment: z.object({
      id: z.string(),
      status: z.string(),
      metadata: z
        .object({
          campaignId: z.string().optional(),
          email: z.string().optional(),
          anonymous: z.string().optional(),
          tipAmount: z.string().optional(),
          baseAmount: z.string().optional(),
        })
        .optional(),
    }),
    isTestEvent: z.boolean().optional(),
  })
  .catchall(z.any()); // Allow additional fields

export type DaimoPayWebhookPayload = z.infer<
  typeof DaimoPayWebhookPayloadSchema
>;
