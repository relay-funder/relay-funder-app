'use client';

import { useQuery } from '@tanstack/react-query';
import { QfCalculationError } from '@/lib/qf/error';
import { QfCampaignMatchingSchema } from '@/lib/qf';

export const QF_CAMPAIGN_MATCHING_QUERY_KEY = 'qf_campaign_matching';

async function fetchCampaignMatching(roundId: number, campaignId: number) {
  const url = `/api/rounds/${roundId}/campaigns/${campaignId}/qf-matching`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch campaign matching calculation';
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
      throw new QfCalculationError(errorMessage, response.status, errorDetails);
    }

    try {
      const data = QfCampaignMatchingSchema.parse(await response.json());
      return data;
    } catch (error) {
      throw new QfCalculationError(
        'Invalid response format: Expected JSON data',
        response.status,
      );
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof QfCalculationError) throw error;

    // Handle network errors and other unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new QfCalculationError(
        'Network error: Unable to connect to server',
      );
    }

    // Handle any other unexpected errors
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new QfCalculationError(`Unexpected error: ${message}`);
  }
}

export function useQfCampaignMatching({
  roundId,
  campaignId,
  enabled = true,
}: {
  roundId: number;
  campaignId: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [QF_CAMPAIGN_MATCHING_QUERY_KEY, roundId, campaignId],
    queryFn: () => fetchCampaignMatching(roundId, campaignId),
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx) or custom Qf errors
      if (
        error instanceof QfCalculationError &&
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
