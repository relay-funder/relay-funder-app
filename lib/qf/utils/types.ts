import { z } from 'zod';

// UserID can be a number (internal ID) or a string (crypto address)
export type UserID = number | string;

interface QfCampaignBase {
  id: number;
  title: string;
  nUniqueContributors: number;
  nContributions: number;
}

interface QfRoundBase {
  id: number;
  title: string;
  matchingPool: string;
  campaigns: QfCampaign[];
}

export interface QfCampaign extends QfCampaignBase {
  status: string;
  aggregatedContributionsByUser: Record<UserID, string>;
}

export interface QfRound extends QfRoundBase {
  blockchain: string;
  status: string;
}

export interface QfRoundState extends QfRoundBase {
  token: string;
  tokenDecimals: number;
}
export interface QfDistributionItem extends QfCampaignBase {
  matchingAmount: string;
}

export type QfDistribution = QfDistributionItem[];

export interface QfCalculationResult {
  totalAllocated: string;
  distribution: QfDistribution;
}

export interface QfSimulationContribution {
  campaignId: number;
  token: string;
  amount: string;
}

export interface QfSimulationBody {
  contributions: QfSimulationContribution[];
  contributorId: UserID;
}

export interface QfSimulationResult {
  baselineDistribution: QfCalculationResult;
  simulatedDistribution: QfCalculationResult;
  deltaDistribution: QfDistribution;
}

export const QfCampaignMatchingSchema = z.object({
  matchingAmount: z.string(),
  nUniqueContributors: z.number(),
  nContributions: z.number(),
});

export type QfCampaignMatching = z.infer<typeof QfCampaignMatchingSchema>;
