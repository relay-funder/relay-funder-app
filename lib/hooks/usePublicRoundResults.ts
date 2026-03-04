import { useQuery } from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import type { GetRoundResponseInstance } from '@/lib/api/types';

const PUBLIC_ROUND_RESULTS_QUERY_KEY = 'public_round_results';
const PUBLIC_ROUNDS_PAGE_SIZE = 50;

interface PaginatedRoundsResponse {
  rounds: GetRoundResponseInstance[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

const MAX_ROUNDS_PAGES = 50;

async function fetchPublicRoundResults(): Promise<GetRoundResponseInstance[]> {
  const allRounds: GetRoundResponseInstance[] = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore && currentPage <= MAX_ROUNDS_PAGES) {
    const response = await fetch(
      `/api/rounds?page=${currentPage}&pageSize=${PUBLIC_ROUNDS_PAGE_SIZE}&forceUserView=true`,
    );
    await handleApiErrors(response, 'Failed to fetch public rounds');
    const data = (await response.json()) as PaginatedRoundsResponse;

    allRounds.push(...(data.rounds ?? []));

    hasMore = Boolean(data.pagination?.hasMore);
    currentPage += 1;
  }

  return allRounds;
}

async function fetchPublicRoundResult(
  roundId: number,
): Promise<GetRoundResponseInstance | null> {
  const response = await fetch(`/api/rounds/${roundId}?forceUserView=true`);
  if (response.status === 404) {
    return null;
  }

  await handleApiErrors(response, 'Failed to fetch round result');
  const data = (await response.json()) as { round: GetRoundResponseInstance };
  return data.round ?? null;
}

export function usePublicRoundResults() {
  return useQuery({
    queryKey: [PUBLIC_ROUND_RESULTS_QUERY_KEY],
    queryFn: fetchPublicRoundResults,
    enabled: true,
  });
}

export function usePublicRoundResult(roundId: number) {
  return useQuery({
    queryKey: [PUBLIC_ROUND_RESULTS_QUERY_KEY, roundId],
    queryFn: () => fetchPublicRoundResult(roundId),
    enabled: Number.isFinite(roundId) && roundId > 0,
  });
}
