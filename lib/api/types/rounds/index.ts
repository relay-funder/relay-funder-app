import { DbCampaign } from '@/types/campaign';

export interface RoundsWithIdParams {
  params: Promise<{
    id: string;
  }>;
}
export interface RoundsWithRoundIdParams {
  params: Promise<{
    roundId: string;
  }>;
}
export interface GetRoundsStatsResponse {
  totalRounds: number;
  totalRaised: number;
  activeRounds: number;
  averageProgress: number;
}
export interface GetRoundResponseInstance {
  id: number;
  title: string;
  description: string;
  tags: string[];
  matchingPool: number;
  applicationStartTime: string;
  applicationEndTime: string;
  startTime: string;
  endTime: string;
  blockchain: string;
  logoUrl: string | null;
  createdAt: string;
  managerAddress: string;
  updatedAt: string;
  roundCampaigns?: {
    id: number;
    roundId: number;
    campaignId: number;
    reviewedAt: string;
    onchainRecipientId: string | null;
    recipientAddress: string | null;
    submittedByWalletAddress: string | null;
    txHash: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    campaign: DbCampaign;
  }[];
}
export interface GetRoundResponse {
  round: GetRoundResponseInstance;
}
export interface PostRoundsResponse {
  roundId: number;
  logoUrl: string | null;
}
export interface PatchRoundResponse {
  roundId: number;
  logoUrl: string | null;
}
export interface GetRoundsStatsResponse {
  totalRounds: number;
  activeRounds: number;
  totalRaised: number;
  averageProgress: number;
}
