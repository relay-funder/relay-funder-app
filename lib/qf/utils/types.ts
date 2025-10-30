import { isAddress } from 'viem';
import { z } from 'zod';

export const UserIdSchema = z.number().or(z.string());
export type UserID = z.infer<typeof UserIdSchema>;

export const UserAddressSchema = z
  .string()
  .length(42, 'Address is required (42 characters)')
  .refine((val) => isAddress(val), {
    message: 'Invalid address format - must be a valid Ethereum address',
  });

export type UserAddress = z.infer<typeof UserAddressSchema>;

export const UserAddressTestSchema = z
  .string()
  .startsWith('0x', '(test)Address must start with 0x');
export type UserAddressTest = z.infer<typeof UserAddressSchema>;

const QfCampaignBaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  nUniqueContributors: z.number(),
  nContributions: z.number(),
});

export const QfCampaignSchema = z.object({
  ...QfCampaignBaseSchema.shape,
  status: z.string(),
  aggregatedContributionsByUser: z.record(UserIdSchema, z.string()),
});

export type QfCampaign = z.infer<typeof QfCampaignSchema>;

const QfRoundBaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  matchingPool: z.string(),
  campaigns: z.array(QfCampaignSchema),
});

export const QfRoundSchema = z.object({
  ...QfRoundBaseSchema.shape,
  blockchain: z.string(),
  status: z.string(),
});

export type QfRound = z.infer<typeof QfRoundSchema>;

export const QfRoundStateSchema = z.object({
  ...QfRoundBaseSchema.shape,
  token: z.string(),
  tokenDecimals: z.number(),
});

export type QfRoundState = z.infer<typeof QfRoundStateSchema>;

export const QfDistributionItemSchema = z.object({
  ...QfCampaignBaseSchema.shape,
  matchingAmount: z.string(),
});

export type QfDistributionItem = z.infer<typeof QfDistributionItemSchema>;

export const QfDistributionSchema = z.array(QfDistributionItemSchema);

export type QfDistribution = z.infer<typeof QfDistributionSchema>;

export const QfCalculationResultSchema = z.object({
  totalAllocated: z.string(),
  distribution: QfDistributionSchema,
});

export type QfCalculationResult = z.infer<typeof QfCalculationResultSchema>;

export const QfSimulationContributionSchema = z.object({
  campaignId: z.number(),
  token: z.string(),
  amount: z.string(),
});

export type QfSimulationContribution = z.infer<
  typeof QfSimulationContributionSchema
>;

export const QfSimulationBodySchema = z.object({
  contributions: z.array(QfSimulationContributionSchema),
  contributorId: UserIdSchema,
  contributorAddress: UserAddressTestSchema,
});

export type QfSimulationBody = z.infer<typeof QfSimulationBodySchema>;

export const QfSimulationResultSchema = z.object({
  baselineDistribution: QfCalculationResultSchema,
  simulatedDistribution: QfCalculationResultSchema,
  deltaDistribution: QfDistributionSchema,
});

export type QfSimulationResult = z.infer<typeof QfSimulationResultSchema>;

export const QfCampaignMatchingSchema = z.object({
  id: z.number(),
  title: z.string(),
  matchingAmount: z.string(),
  nUniqueContributors: z.number(),
  nContributions: z.number(),
});

export type QfCampaignMatching = z.infer<typeof QfCampaignMatchingSchema>;
