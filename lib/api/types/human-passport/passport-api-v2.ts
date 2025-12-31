import { z } from 'zod';

export const NumericString = z
  .string()
  .trim()
  .refine(
    (v) => !Number.isNaN(Number.parseFloat(v)),
    'Expected numeric string',
  );

export const PassportStampDataSchema = z.object({
  score: NumericString,
  dedup: z.boolean(),
  expiration_date: z.string(),
});

export type PassportStampData = z.infer<typeof PassportStampDataSchema>;

export const PassportScoreResponseSchema = z.object({
  address: z
    .string()
    .trim()
    .refine(
      (addr) => addr.startsWith('0x') && addr.length >= 10,
      'Invalid address',
    ),
  score: NumericString.nullable().optional(),
  passing_score: z.boolean().optional(),
  last_score_timestamp: z.string().optional(),
  expiration_timestamp: z.string().nullable().optional(),
  threshold: NumericString.optional(),
  error: z.string().nullable().optional(),
  stamps: z.record(PassportStampDataSchema).default({}),
});

export type PassportScoreResponse = z.infer<typeof PassportScoreResponseSchema>;

/**
 * Individual stamp metadata
 */
export const PassportStampSchema = z.object({
  version: z.string(),
  credential: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

export type PassportStamp = z.infer<typeof PassportStampSchema>;

/**
 * Response from GET /v2/stamps/{address}
 */
export const PassportStampsResponseSchema = z.object({
  next: z.string().nullable(),
  prev: z.string().nullable(),
  items: z.array(PassportStampSchema),
});

export type PassportStampsResponse = z.infer<
  typeof PassportStampsResponseSchema
>;
