import { useQuery } from '@tanstack/react-query';

const TREASURY_BALANCE_QUERY_KEY = 'treasury_balance';

// Fetch treasury balance via API instead of direct blockchain calls
async function fetchTreasuryBalance(treasuryAddress: string): Promise<any> {
  const response = await fetch(
    `/api/treasury/balance?address=${treasuryAddress}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch treasury balance');
  }
  return response.json();
}

// Fetch campaign treasury address and balance
async function fetchCampaignTreasuryBalance(campaignId: number): Promise<any> {
  const response = await fetch(`/api/campaigns/${campaignId}/treasury-balance`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaign treasury balance');
  }
  return response.json();
}

export function useTreasuryBalance(treasuryAddress?: string | null) {
  return useQuery({
    queryKey: [TREASURY_BALANCE_QUERY_KEY, treasuryAddress],
    queryFn: async (): Promise<any | null> => {
      if (!treasuryAddress) {
        return null;
      }

      try {
        return await fetchTreasuryBalance(treasuryAddress);
      } catch (error) {
        console.error('Error fetching treasury balance:', error);
        return null;
      }
    },
    enabled: !!treasuryAddress,
    staleTime: 30000, // 30 seconds - treasury balance changes frequently
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCampaignTreasuryBalance(campaignId?: number) {
  return useQuery({
    queryKey: [TREASURY_BALANCE_QUERY_KEY, 'campaign', campaignId],
    queryFn: async (): Promise<any | null> => {
      if (!campaignId) {
        return null;
      }

      try {
        return await fetchCampaignTreasuryBalance(campaignId);
      } catch (error) {
        console.error('Error fetching campaign treasury balance:', error);
        return null;
      }
    },
    enabled: !!campaignId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
