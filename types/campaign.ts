export interface Campaign {
  id: number;
  title: string;
  description: string;
  fundingGoal: string;
  startTime: Date;
  endTime: Date;
  creatorAddress: string;
  status: string;
  transactionHash: string | null;
  campaignAddress: string;
  address: string;
  owner: string;
  launchTime: string;
  deadline: string;
  goalAmount: string;
  totalRaised: string;
  amountRaised: string;
  location: string;
  images: {
    id: number;
    imageUrl: string;
    isMainImage: boolean;
  }[];
}

