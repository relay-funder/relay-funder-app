/**
 * Add hook to update round basic fields via FormData to match PATCH API
 *
 * The backend PATCH /api/admin/rounds endpoint expects multipart/form-data with:
 * - roundId
 * - title
 * - description
 * - descriptionUrl (optional)
 * - matchingPool
 * - startTime
 * - endTime
 * - applicationStartTime
 * - applicationEndTime
 * - tags (comma-separated string)
 * - logo (optional File)
 *
 * This hook wraps that contract and performs the appropriate cache invalidations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ROUNDS_QUERY_KEY, ROUND_QUERY_KEY } from './useRounds';
import { handleApiErrors } from '@/lib/api/error';

export interface UpdateRoundBasicInput {
  roundId: number;
  title: string;
  description: string;
  descriptionUrl?: string | null;

  // The backend expects these fields even if we're not editing them here.
  matchingPool: number;
  startTime: string; // ISO or yyyy-MM-ddTHH:mm
  endTime: string;
  applicationStartTime: string;
  applicationEndTime: string;
  tags: string[];

  // Optional new logo file
  logo?: File | null;
}

async function updateRoundBasic(input: UpdateRoundBasicInput) {
  if (!input?.roundId || input.roundId <= 0) {
    throw new Error('Invalid roundId');
  }

  const form = new FormData();
  form.append('roundId', String(input.roundId));
  form.append('title', input.title);
  form.append('description', input.description);
  form.append('matchingPool', String(input.matchingPool));
  form.append('startTime', input.startTime);
  form.append('endTime', input.endTime);
  form.append('applicationStartTime', input.applicationStartTime);
  form.append('applicationEndTime', input.applicationEndTime);

  // API expects tags as a comma-separated list of URL-encoded values
  form.append(
    'tags',
    Array.isArray(input.tags)
      ? input.tags.map((t) => encodeURIComponent(t)).join(',')
      : '',
  );

  if (typeof input.descriptionUrl === 'string') {
    form.append('descriptionUrl', input.descriptionUrl);
  }

  if (input.logo) {
    form.append('logo', input.logo);
  }

  const response = await fetch('/api/admin/rounds', {
    method: 'PATCH',
    body: form,
  });
  await handleApiErrors(response, 'Failed to update round');
  return response.json();
}

export function useUpdateRoundBasic() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateRoundBasic,
    onSuccess: (_data, vars) => {
      // Invalidate lists/infinite lists and the specific round detail
      qc.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10] });
      qc.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3] });
      qc.invalidateQueries({ queryKey: [ROUND_QUERY_KEY, vars.roundId] });
    },
  });
}
