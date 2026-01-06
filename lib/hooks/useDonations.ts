import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';

interface DonationCampaign {
  id: number;
  title: string;
  slug: string;
  status: string;
  fundingGoal: string;
  category: string;
  location: string;
  createdAt: string;
  endTime: string | null;
  isCompleted: boolean;
  isOngoing: boolean;
  image: string | null;
}

interface RoundContribution {
  id: number;
  humanityScore: number;
  round: {
    id: number;
    title: string;
    status: string;
  };
}

export interface UserDonation {
  id: number;
  amount: number;
  token: string;
  status: string;
  date: string;
  transactionHash: string | null;
  isAnonymous: boolean;
  campaign: DonationCampaign;
  roundContribution: RoundContribution | null;
}

export interface DonationStats {
  totalDonated: number;
  totalCampaigns: number;
  totalDonations: number;
}

interface PaginatedDonationsResponse {
  donations: UserDonation[];
  stats: DonationStats;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

const DONATIONS_QUERY_KEY = 'user_donations';
const DONATION_STATS_QUERY_KEY = 'donation_stats';

async function fetchUserDonations({
  pageParam = 1,
  pageSize = 10,
}: {
  pageParam?: number;
  pageSize?: number;
}) {
  const url = `/api/users/donations?page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch donations');
  const data = await response.json();
  return data as PaginatedDonationsResponse;
}

async function fetchDonationStats() {
  const url = `/api/users/donations?page=1&pageSize=1`;
  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch donation stats');
  const data = await response.json();
  return data.stats as DonationStats;
}

export function useUserDonations({
  pageSize = 10,
}: { pageSize?: number } = {}) {
  return useQuery({
    queryKey: [DONATIONS_QUERY_KEY, 'page', pageSize],
    queryFn: () => fetchUserDonations({ pageParam: 1, pageSize }),
    enabled: true,
  });
}

export function useInfiniteUserDonations({
  pageSize = 10,
}: { pageSize?: number } = {}) {
  return useInfiniteQuery<PaginatedDonationsResponse, Error>({
    queryKey: [DONATIONS_QUERY_KEY, 'infinite', pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchUserDonations({ pageParam: pageParam as number, pageSize }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useDonationStats() {
  return useQuery({
    queryKey: [DONATION_STATS_QUERY_KEY],
    queryFn: fetchDonationStats,
    enabled: true,
  });
}
