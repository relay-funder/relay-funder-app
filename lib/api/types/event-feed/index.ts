import { z } from 'zod';
import { PaginatedRequestSchema, PaginatedResponseSchema } from '../common';

export const NotifyTypeSchema = z.enum([
  'CampaignApprove',
  'CampaignDisable',
  'CampaignComment',
  'CampaignPayment',
  'CampaignUpdate',
]);
export type NotifyType = z.infer<typeof NotifyTypeSchema>;
export const EventFeedItemSchema = z.object({
  createdAt: z.string(),
  type: NotifyTypeSchema,
  message: z.string(),
  data: z.unknown(),
});
export const GetEventFeedRequestSchema = PaginatedRequestSchema.extend({
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export const GetEventFeedResponseSchema = PaginatedResponseSchema.extend({
  events: z.array(EventFeedItemSchema),
});
