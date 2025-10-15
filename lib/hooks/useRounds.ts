import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import type {
  GetRoundResponseInstance,
  GetRoundResponse,
  PostRoundsResponse,
  PatchRoundResponse,
  GetRoundsStatsResponse,
} from '@/lib/api/types';
import { resetCampaign } from './useCampaigns';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const ROUNDS_QUERY_KEY = 'rounds';
export const ROUND_QUERY_KEY = 'round';
export const ROUND_STATS_QUERY_KEY = 'round_stats';
export const ROUND_PAYMENTS_QUERY_KEY = 'round_payments';

interface PaginatedRoundsResponse extends PaginatedResponse {
  rounds: GetRoundResponseInstance[];
}

async function fetchRounds(status?: string) {
  const url = status ? `/api/rounds?status=${status}` : '/api/rounds';
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch rounds');
  }
  const data = await response.json();
  return data.rounds;
}
async function fetchRound(id: number, forceUserView = false) {
  const params = new URLSearchParams();
  if (forceUserView) {
    params.set('forceUserView', 'true');
  }

  const url = `/api/rounds/${id}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch round');
  }
  const data = await response.json();
  return data as GetRoundResponse;
}

async function fetchRoundPage({
  pageParam = 1,
  pageSize = 10,
  forceUserView = false,
}) {
  const params = new URLSearchParams({
    page: pageParam.toString(),
    pageSize: pageSize.toString(),
  });

  if (forceUserView) {
    params.set('forceUserView', 'true');
  }

  const url = `/api/rounds?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch rounds');
  }
  const data = await response.json();
  return data as PaginatedRoundsResponse;
}

async function fetchRoundStats() {
  const url = `/api/rounds/stats`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch round');
  }
  const data = await response.json();
  return data as GetRoundsStatsResponse;
}

interface IUpdateRound {
  roundId: number;
  title: string;
  description: string;
  matchingPool: number;
  startTime: string;
  endTime: string;
  applicationStartTime: string;
  applicationEndTime: string;
  tags: string[];
  logo: File | null;
}
async function updateRound(variables: IUpdateRound) {
  const response = await fetch('/api/rounds', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...variables,
      tags: variables?.tags
        ?.map((tag: string) => encodeURIComponent(tag))
        .join(','),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update round');
  }

  const data = await response.json();
  return data as PatchRoundResponse;
}
interface ICreateRound {
  title: string;
  description: string;
  matchingPool: number;
  startTime: string;
  endTime: string;
  applicationStartTime: string;
  applicationEndTime: string;
  tags?: string[];
  logo?: File | null;
}
async function createRound({
  title,
  description,
  matchingPool,
  startTime,
  endTime,
  applicationStartTime,
  applicationEndTime,
  logo,
  tags,
}: ICreateRound) {
  const formDataToSend = new FormData();
  formDataToSend.append('title', title);
  formDataToSend.append('description', description);
  formDataToSend.append('matchingPool', `${matchingPool}`);
  formDataToSend.append('startTime', startTime);
  formDataToSend.append('endTime', endTime);
  formDataToSend.append('applicationStartTime', applicationStartTime);
  formDataToSend.append('applicationEndTime', applicationEndTime);
  formDataToSend.append(
    'tag',
    tags?.map((tag: string) => encodeURIComponent(tag)).join(',') ?? '',
  );
  if (logo) {
    formDataToSend.append('logo', logo);
  }
  const response = await fetch('/api/rounds', {
    method: 'POST',
    body: formDataToSend,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to save round';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data as PostRoundsResponse;
}

interface IRemoveRound {
  roundId: number;
}
async function removeRound(variables: IRemoveRound) {
  const response = await fetch(`/api/rounds/${variables.roundId}`, {
    method: 'DELETE',
    body: JSON.stringify(variables),
  });
  if (!response.ok) {
    let errorMsg = 'Failed to remove round';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

interface ICreateRoundCampaign {
  roundId: number;
  campaignId: number;
  applicationReason: string;
  status?: 'PENDING' | 'REJECTED' | 'APPROVED';
}
async function createRoundCampaign(variables: ICreateRoundCampaign) {
  const formDataToSend = new FormData();
  formDataToSend.append('roundId', `${variables.roundId}`);
  formDataToSend.append('campaignId', `${variables.campaignId}`);
  formDataToSend.append('applicationReason', `${variables.applicationReason}`);
  if (variables.status) {
    formDataToSend.append('status', variables.status);
  }
  const response = await fetch(`/api/rounds/${variables.roundId}/campaigns`, {
    method: 'POST',
    body: formDataToSend,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to create round-campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}
interface IUpdateRoundCampaign {
  roundId: number;
  campaignId: number;
  status: 'PENDING' | 'REJECTED' | 'APPROVED';
}
async function updateRoundCampaign(variables: IUpdateRoundCampaign) {
  const formDataToSend = new FormData();
  formDataToSend.append('roundId', `${variables.roundId}`);
  formDataToSend.append('campaignId', `${variables.campaignId}`);
  formDataToSend.append('status', variables.status);
  const response = await fetch(`/api/rounds/${variables.roundId}/campaigns`, {
    method: 'PATCH',
    body: formDataToSend,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to update round-campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}
interface IRemoveRoundCampaign {
  roundId: number;
  campaignId: number;
}
async function removeRoundCampaign(variables: IRemoveRoundCampaign) {
  const formDataToSend = new FormData();
  formDataToSend.append('roundId', `${variables.roundId}`);
  formDataToSend.append('campaignId', `${variables.campaignId}`);
  const response = await fetch(`/api/rounds/${variables.roundId}/campaigns`, {
    method: 'DELETE',
    body: formDataToSend,
  });
  if (!response.ok) {
    let errorMsg = 'Failed to remove round-campaign';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error
        ? `${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`
        : errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}
export function useRounds(status?: string) {
  return useQuery({
    queryKey: [ROUNDS_QUERY_KEY, status],
    queryFn: () => fetchRounds(status),
    enabled: true,
  });
}

async function fetchActiveRound() {
  const response = await fetch('/api/rounds/active');
  if (!response.ok) {
    let message = 'Failed to fetch active round';
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = await response.json();
  return data.round;
}

export function useActiveRound() {
  return useQuery({
    queryKey: [ROUNDS_QUERY_KEY, 'active'],
    queryFn: fetchActiveRound,
    enabled: true,
  });
}

async function fetchUpcomingRound() {
  const response = await fetch('/api/rounds/upcoming');
  if (!response.ok) {
    let message = 'Failed to fetch upcoming round';
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = await response.json();
  return data.round;
}

export function useUpcomingRound() {
  return useQuery({
    queryKey: [ROUNDS_QUERY_KEY, 'upcoming'],
    queryFn: fetchUpcomingRound,
    enabled: true,
  });
}

export function useRound(id: number, forceUserView = false) {
  return useQuery({
    queryKey: [ROUND_QUERY_KEY, id, forceUserView],
    queryFn: () => fetchRound(id, forceUserView),
    enabled: true,
  });
}

export function useInfiniteRounds(pageSize = 10, forceUserView = false) {
  return useInfiniteQuery<PaginatedRoundsResponse, Error>({
    queryKey: [ROUNDS_QUERY_KEY, 'infinite', pageSize, forceUserView],
    queryFn: ({ pageParam = 1 }) =>
      fetchRoundPage({
        pageParam: pageParam as number,
        pageSize,
        forceUserView,
      }),
    getNextPageParam: (lastPage: PaginatedRoundsResponse) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedRoundsResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useUpdateRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRound,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUND_QUERY_KEY, variables.roundId],
      });
    },
  });
}
export function useCreateRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3],
      });
      queryClient.invalidateQueries({ queryKey: [ROUND_STATS_QUERY_KEY] });
    },
  });
}

export function useRemoveRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeRound,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUND_QUERY_KEY, variables.roundId],
      });
      queryClient.invalidateQueries({ queryKey: [ROUNDS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ROUND_STATS_QUERY_KEY] });
    },
  });
}

export function useRoundStats() {
  return useQuery({
    queryKey: [ROUND_STATS_QUERY_KEY],
    queryFn: fetchRoundStats,
    enabled: true,
  });
}

export function useCreateRoundCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoundCampaign,
    onSuccess: (_data, variables) => {
      resetCampaign(variables.campaignId, queryClient);
      queryClient.invalidateQueries({
        queryKey: [ROUND_QUERY_KEY, variables.roundId],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3],
      });
      queryClient.invalidateQueries({ queryKey: [ROUND_STATS_QUERY_KEY] });
    },
  });
}

export function useUpdateRoundCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRoundCampaign,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ROUND_QUERY_KEY, variables.roundId],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3],
      });
      queryClient.invalidateQueries({ queryKey: [ROUND_STATS_QUERY_KEY] });
    },
  });
}

export function useRemoveRoundCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeRoundCampaign,
    onSuccess: (_data, variables) => {
      resetCampaign(variables.campaignId, queryClient);
      queryClient.invalidateQueries({
        queryKey: [ROUND_QUERY_KEY, variables.roundId],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 10],
      });
      queryClient.invalidateQueries({
        queryKey: [ROUNDS_QUERY_KEY, 'infinite', 3],
      });
      queryClient.invalidateQueries({ queryKey: [ROUND_STATS_QUERY_KEY] });
    },
  });
}
