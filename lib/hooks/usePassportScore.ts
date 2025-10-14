'use client';

import { useAuth } from '@/contexts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GetPassportErrorResponse, GetPassportResponse } from '@/lib/api/types';

export const PASSPORT_QUERY_KEY = 'passport_score';

/**
 * Verifies a Passport score and updates the humanity score in the database
 */
async function verifyUserPassportScore(): Promise<GetPassportResponse> {
  const response = await fetch('/api/users/human-passport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
export function usePassportScore() {
  const { authenticated } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [PASSPORT_QUERY_KEY],
    queryFn: async () => {
      const data = await verifyUserPassportScore();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return data;
    },
    enabled: authenticated,
    retry: false,
  });
}
