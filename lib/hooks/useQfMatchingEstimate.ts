'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const QUERY_KEY_QF_MATCHING_ESTIMATE = 'qf_matching_estimate';

interface QfMatchingEstimateResponse {
  estimatedMatch: string;
  marginalMatch: string;
}

async function fetchMatchingEstimate(
  roundId: number,
  campaignId: number,
  amount: string,
): Promise<QfMatchingEstimateResponse> {
  const params = new URLSearchParams({ amount });
  const url = `/api/rounds/${roundId}/campaigns/${campaignId}/qf-matching/estimate?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch QF estimate');
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.data;
}

export function useQfMatchingEstimate({
  roundId,
  campaignId,
  amount,
  enabled = true,
  debounceMs = 500,
}: {
  roundId: number;
  campaignId: number;
  amount: string;
  enabled?: boolean;
  debounceMs?: number;
}) {
  const [debouncedAmount, setDebouncedAmount] = useState(amount);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAmount(amount);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [amount, debounceMs]);

  return useQuery({
    queryKey: [
      QUERY_KEY_QF_MATCHING_ESTIMATE,
      roundId,
      campaignId,
      debouncedAmount,
    ],
    queryFn: () => fetchMatchingEstimate(roundId, campaignId, debouncedAmount),
    enabled: enabled && !!debouncedAmount && parseFloat(debouncedAmount) > 0,
    staleTime: 60000,
  });
}
