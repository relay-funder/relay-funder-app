import { handleApiErrors, ApiParameterError } from '@/lib/api/error';
import { TreasuryBalance } from '@/lib/treasury/interface';
import { useQuery } from '@tanstack/react-query';

const TREASURY_BALANCE_QUERY_KEY = 'treasury_balance';

// Fetch treasury balance via API instead of direct blockchain calls
async function fetchTreasuryBalance(
  treasuryAddress?: string | null,
): Promise<{ balance: TreasuryBalance }> {
  if (!treasuryAddress) {
    throw new ApiParameterError('Invalid Treasury Address');
  }
  const response = await fetch(
    `/api/treasury/balance?address=${treasuryAddress}`,
  );
  await handleApiErrors(response, 'Failed to fetch treasury balance');
  return response.json();
}

// Fetch campaign treasury address and balance
async function fetchCampaignTreasuryBalance(
  campaignId?: number | null,
): Promise<{ balance: TreasuryBalance; treasuryAddress?: string }> {
  if (!campaignId) {
    throw new ApiParameterError('Invalid Campaign to fetch Treasury Balance');
  }
  const response = await fetch(`/api/campaigns/${campaignId}/treasury-balance`);
  await handleApiErrors(response, 'Failed to fetch campaign treasury balance');

  return response.json();
}

export function useTreasuryBalance(treasuryAddress?: string | null) {
  return useQuery({
    queryKey: [TREASURY_BALANCE_QUERY_KEY, treasuryAddress],
    queryFn: async () => fetchTreasuryBalance(treasuryAddress),
    enabled: !!treasuryAddress,
    staleTime: 30000, // 30 seconds - treasury balance changes frequently
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useCampaignTreasuryBalance(campaignId?: number) {
  return useQuery({
    queryKey: [TREASURY_BALANCE_QUERY_KEY, 'campaign', campaignId],
    queryFn: async () => fetchCampaignTreasuryBalance(campaignId),
    enabled: !!campaignId,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
