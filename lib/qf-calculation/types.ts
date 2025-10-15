import { Prisma } from '@/server/db';
import { roundForQFSelect } from './queries';

export type QFRoundDB = Prisma.RoundGetPayload<{
  select: typeof roundForQFSelect;
}>;

export type QFCampaignDB = QFRoundDB['roundCampaigns'][number];

export type QFPaymentDB = QFCampaignDB['Campaign']['payments'][number];

// UserID can be a number (internal ID) or a string (crypto address)
export type UserID = number | string;

export interface QFCalculationResult {
  totalAllocated: string;
  distribution: QFDistribution;
}

export type QFDistribution = Array<{
  id: number;
  title: string;
  matchingAmount: string;
}>;

export interface QFCampaign {
  id: number;
  title: string;
  status: string;
  contributions: QFPaymentDB[];
  aggregatedContributionsByUser: Record<UserID, bigint>;
}

export interface QFRound {
  id: number;
  title: string;
  matchingPool: bigint;
  blockchain: string;
  status: string;
  campaigns: QFCampaign[];
}
