import { z } from 'zod';
import { PaginatedRequestSchema, PaginatedResponseSchema } from '../common';

export const ScoreEventSchema = z.object({
  id: z.number(),
  type: z.string(),
  action: z.string(),
  points: z.number(),
  category: z.enum(['donor', 'creator']),
  createdAt: z.string(),
  data: z.unknown().optional(),
});

export const GetScoreEventsRequestSchema = PaginatedRequestSchema.extend({
  category: z.enum(['donor', 'creator']).optional(),
});

export const GetScoreEventsResponseSchema = PaginatedResponseSchema.extend({
  events: z.array(ScoreEventSchema),
});

export type ScoreEvent = z.infer<typeof ScoreEventSchema>;
export type GetScoreEventsRequest = z.infer<typeof GetScoreEventsRequestSchema>;
export type GetScoreEventsResponse = z.infer<
  typeof GetScoreEventsResponseSchema
>;
