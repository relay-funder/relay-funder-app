export interface Round {
  id: string;
  title: string;
  description: string;
  type: 'OSS_ROUND' | 'COMMUNITY_ROUND';
  category: string;
  matchingPool: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ENDED';
  organization: {
    name: string;
    logo: string;
  };
  campaigns?: string[]; // Array of campaign addresses in this round
} 