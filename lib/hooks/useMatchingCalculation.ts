'use client';

import { useQuery } from '@tanstack/react-query';
import type { QFCalculationResult } from '@/lib/qf-calculation/types';
import { QFCalculationError } from '@/lib/qf-calculation';

export const MATCHING_CALCULATION_QUERY_KEY = 'matching_calculation';

async function fetchRoundMatchingCalculation(id: number) {
  const url = `/api/qf-calculation/${id}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch round matching calculation';
      let errorDetails: unknown;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.details) {
          errorDetails = errorData.details;
        }
      } catch {
        // Response wasn't JSON, use default message
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new QFCalculationError(errorMessage, response.status, errorDetails);
    }

    try {
      const data = await response.json();
      return data as QFCalculationResult;
    } catch (error) {
      throw new QFCalculationError(
        'Invalid response format: Expected JSON data',
        response.status,
      );
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof QFCalculationError) throw error;

    // Handle network errors and other unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new QFCalculationError(
        'Network error: Unable to connect to server',
      );
    }

    // Handle any other unexpected errors
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new QFCalculationError(`Unexpected error: ${message}`);
  }
}

export function useMatchingCalculation({
  roundId,
  enabled = true,
}: {
  roundId: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [MATCHING_CALCULATION_QUERY_KEY, roundId],
    queryFn: () => fetchRoundMatchingCalculation(roundId),
    enabled: roundId !== undefined && enabled,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx) or custom QF errors
      if (
        error instanceof QFCalculationError &&
        error.status &&
        error.status >= 400 &&
        error.status < 500
      ) {
        return false;
      }
      // Retry up to 3 times for network errors
      return failureCount < 3;
    },
  });
}
