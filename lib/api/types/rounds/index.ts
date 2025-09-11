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
export interface GetRoundCampaignResponseInstance {
  id: number;
  roundId: number;
  campaignId: number;
  reviewedAt: string | null;
  onchainRecipientId: string | null;
  recipientAddress: string | null;
  submittedByWalletAddress: string | null;
  txHash: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  campaign?: DbCampaign;
}
export interface GetRoundResponseInstance {
  id: number;
  title: string;
  description: string;
  tags: string[];
  matchingPool: number;
  poolId?: number | null;
  applicationStartTime: string;
  applicationEndTime: string;
  startTime: string;
  endTime: string;
  blockchain: string;
  logoUrl: string | null;
  createdAt: string;
  managerAddress: string;
  updatedAt: string;
  roundCampaigns?: GetRoundCampaignResponseInstance[];
  recipientStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
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
