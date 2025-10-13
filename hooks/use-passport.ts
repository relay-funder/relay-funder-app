'use client';

import { useAuth } from '@/contexts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  GetPassportResponse,
  GetPassportErrorResponse,
} from '@/app/api/users/human-passport/route';
import { ONE_MINUTE_MS } from '@/lib/constant/time';

export const PASSPORT_QUERY_KEY = 'passport_score';

/**
 * Verifies a Passport score and updates the humanity score in the database
 */
async function verifyPassportScore(
  address?: string,
): Promise<GetPassportResponse> {
  const response = await fetch('/api/users/human-passport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: address ? JSON.stringify({ address }) : undefined,
  });

  if (!response.ok) {
    const error = (await response.json()) as GetPassportErrorResponse;
    throw new Error(
      error.details || error.error || 'Failed to verify Passport score',
    );
  }

  return response.json();
}

/**
 * Hook to fetch the user's current Passport score
 */
export function usePassportScore(params?: {
  address?: string;
  enabled?: boolean;
  staleTimeMs?: number;
}) {
  const {
    address,
    enabled = true,
    staleTimeMs = 10 * ONE_MINUTE_MS, // 10 minutes, scores don't change frequently
  } = params ?? {};

  const { authenticated, address: authAddress } = useAuth();
  const queryClient = useQueryClient();

  const queryKeyAddress = address ?? authAddress;

  return useQuery({
    queryKey: [PASSPORT_QUERY_KEY, queryKeyAddress],
    queryFn: async () => {
      const data = await verifyPassportScore(address);

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      return data;
    },
    enabled: enabled && authenticated && !!queryKeyAddress,
    retry: false,
    staleTime: staleTimeMs,
  });
}
