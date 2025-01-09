export interface DbCampaign {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
  creatorAddress: string;
  status: string;
  transactionHash: string | null;
  campaignAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: number;
    imageUrl: string;
    isMainImage: boolean;
    campaignId: number;
  }[];
  slug: string;
}

export interface Campaign extends DbCampaign {
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  location?: string;
  amountRaised?: string;
}

export interface CombinedCampaignData {
  id: number;
  title: string;
  description: string;
  status: string;
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  images: DbCampaign['images'];
}
