import { z } from 'zod';
import { NumericString, PassportStampDataSchema } from './passport-api-v2';

export * from './passport-api-v2';

export const GetPassportResponseSchema = z.object({
  success: z.literal(true),
  address: z.string(),
  humanityScore: z.number().int().min(0),
  passportScore: NumericString,
  passingScore: z.boolean(),
  threshold: NumericString,
  lastScoreTimestamp: z.string(),
  expirationTimestamp: z.string(),
  stamps: z.record(PassportStampDataSchema).optional(),
});

export type GetPassportResponse = z.infer<typeof GetPassportResponseSchema>;

export const GetPassportErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.string().optional(),
});

export type GetPassportErrorResponse = z.infer<
  typeof GetPassportErrorResponseSchema
>;
