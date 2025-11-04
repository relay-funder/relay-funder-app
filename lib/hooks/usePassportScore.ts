'use client';

import { useAuth } from '@/contexts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GetPassportErrorResponseSchema,
  GetPassportResponse,
  GetPassportResponseSchema,
} from '@/lib/api/types';
import { PROFILE_QUERY_KEY } from '@/lib/hooks/useProfile';

export const PASSPORT_QUERY_KEY = 'passport_score';

/**
 * Verifies a Passport score and updates the humanity score in the database
 */
async function verifyUserPassportScore(): Promise<GetPassportResponse> {
  const response = await fetch('/api/users/human-passport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await response.json();

  if (!response.ok) {
    const parsedErr = GetPassportErrorResponseSchema.safeParse(json);

    const message = parsedErr.success
      ? parsedErr.data.details || parsedErr.data.error
      : 'Failed to verify Passport score';

    throw new Error(message);
  }

  const parsed = GetPassportResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid Passport response: ${parsed.error.message}`);
  }
  return parsed.data;
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
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] });
      return data;
    },
    enabled: authenticated,
    retry: false,
  });
}
