'use client';

import { useQuery } from '@tanstack/react-query';
import { QfCalculationResult, QfCalculationResultSchema } from '@/lib/qf';
import {
  createQfErrorHandler,
  handleQfApiResponse,
  qfRetryConfig,
} from './utils/error-handler';

export const QUERY_KEY_QF_ADMIN_ROUND_MATCHING =
  'qf_admin_matching_calculation';

async function fetchRoundMatchingCalculation(
  id: number,
): Promise<QfCalculationResult> {
  const url = `/api/admin/rounds/${id}/qf`;

  try {
    const response = await fetch(url);
    return await handleQfApiResponse(
      response,
      'Failed to fetch round distribution calculation',
      QfCalculationResultSchema,
    );
  } catch (error) {
    return createQfErrorHandler()(error);
  }
}

export function useAdminQfRoundCalculation({
  roundId,
  enabled = true,
}: {
  roundId: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEY_QF_ADMIN_ROUND_MATCHING, roundId],
    queryFn: () => fetchRoundMatchingCalculation(roundId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - QF calculations don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    ...qfRetryConfig,
  });
}
