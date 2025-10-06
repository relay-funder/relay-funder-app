import { useQuery } from '@tanstack/react-query';
import { QFCalculationResult } from '@/lib/qf-calculation/types';

export const MATCHING_CALCULATION_QUERY_KEY = 'matching_calculation';
export const CAMPAIGN_MATCHING_CALCULATION_QUERY_KEY =
  'campaign_matching_calculation';

async function fetchRoundMatchingCalculation(id: number) {
  const url = `/api/qf-calculation/${id}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || 'Failed to fetch round matching calculation',
    );
  }
  const data = await response.json();
  return data as QFCalculationResult;
}

export function useMatchingCalculation(roundId: number) {
  return useQuery({
    queryKey: [MATCHING_CALCULATION_QUERY_KEY, roundId],
    queryFn: () => fetchRoundMatchingCalculation(roundId),
    enabled: true,
  });
}
