import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';

export const ROUND_RESULTS_QUERY_KEY = 'round_results';

type ResultsFormat = 'json' | 'csv';

interface GenerateArgs {
  roundId: number;
  minHumanityScore?: number;
  fmt?: ResultsFormat;
}

/**
 * Mutation to generate round results via the admin endpoint.
 * - fmt=json: returns parsed JSON
 * - fmt=csv: returns CSV text
 */
export function useGenerateRoundResults() {
  return useMutation({
    mutationFn: async ({
      roundId,
      minHumanityScore = 50,
      fmt = 'json',
    }: GenerateArgs) => {
      if (!roundId || roundId <= 0) {
        throw new Error('Invalid roundId');
      }
      const url = `/api/admin/rounds/${roundId}/results/generate?fmt=${fmt}&minHumanityScore=${minHumanityScore}`;
      const response = await fetch(url, { method: 'POST' });
      await handleApiErrors(response, 'Failed to generate results');

      if (fmt === 'csv') {
        return await response.text();
      }
      return await response.json();
    },
  });
}

/**
 * Query to fetch approved results stored on the round
 * Returns the raw approvedResult payload (unknown shape by design),
 * or null when not present.
 */
export function useApprovedRoundResults(roundId: number) {
  return useQuery({
    queryKey: [ROUND_RESULTS_QUERY_KEY, roundId],
    queryFn: async () => {
      if (!roundId || roundId <= 0) {
        throw new Error('Invalid roundId');
      }
      const response = await fetch(
        `/api/admin/rounds/${roundId}/results/approve`,
        {
          method: 'GET',
        },
      );
      await handleApiErrors(response, 'Failed to fetch approved results');

      const data = await response.json();
      return (data?.approvedResult ?? null) as unknown;
    },
    enabled: !!roundId && roundId > 0,
  });
}

interface ApproveArgs {
  roundId: number;
  file?: File;
  json?: unknown;
}

/**
 * Mutation to approve/store results on the round:
 * - Send a file via multipart/form-data (CSV or JSON), or
 * - Send a JSON payload directly (application/json)
 */
export function useApproveRoundResults() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ roundId, file, json }: ApproveArgs) => {
      if (!roundId || roundId <= 0) {
        throw new Error('Invalid roundId');
      }
      if (!file && typeof json === 'undefined') {
        throw new Error('Provide file or json to approve');
      }

      let response: Response;
      if (file) {
        const form = new FormData();
        form.append('file', file);
        response = await fetch(`/api/admin/rounds/${roundId}/results/approve`, {
          method: 'POST',
          body: form,
        });
      } else {
        response = await fetch(`/api/admin/rounds/${roundId}/results/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
      }
      await handleApiErrors(response, 'Failed to approve results');

      return await response.json();
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: [ROUND_RESULTS_QUERY_KEY, variables.roundId],
      });
    },
  });
}
