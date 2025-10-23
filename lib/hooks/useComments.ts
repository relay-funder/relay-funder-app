import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import type { GetCampaignCommentResponseInstance } from '@/lib/api/types';
import { PaginatedResponse } from '@/lib/api/types/common';
export const CAMPAIGNS_COMMENTS_QUERY_KEY = 'campaigns_comments';

interface ICreateComment {
  campaignId: number;
  content: string;
}
async function createComment(variables: ICreateComment) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    },
  );

  await handleApiErrors(response, 'Failed to create comment');

  return response.json();
}
interface IRemoveComment {
  campaignId: number;
  commentId: number;
}
async function removeComment(variables: IRemoveComment) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/comments`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    },
  );

  await handleApiErrors(response, 'Failed to remove comment');

  return response.json();
}
interface IReportComment {
  campaignId: number;
  commentId: number;
}
async function reportComment(variables: IReportComment) {
  const response = await fetch(
    `/api/campaigns/${variables.campaignId}/comments/${variables.commentId}/report`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(variables),
    },
  );

  await handleApiErrors(response, 'Failed to report comment');

  return response.json();
}

interface PaginatedCommentResponse extends PaginatedResponse {
  comments: GetCampaignCommentResponseInstance[];
}

async function fetchCommentPage({
  campaignId,
  pageParam = 1,
  pageSize = 10,
}: {
  campaignId: number;
  pageParam?: number;
  pageSize?: number;
}) {
  const url = `/api/campaigns/${campaignId}/comments?page=${pageParam}&pageSize=${pageSize}`;
  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch comments');
  const data = await response.json();
  return data as PaginatedCommentResponse;
}

export function useInfiniteComments(campaignId: number, pageSize = 10) {
  return useInfiniteQuery<PaginatedCommentResponse, Error>({
    queryKey: [CAMPAIGNS_COMMENTS_QUERY_KEY, 'infinite', campaignId],
    queryFn: ({ pageParam = 1 }) =>
      fetchCommentPage({
        campaignId,
        pageParam: pageParam as number,
        pageSize,
      }),
    getNextPageParam: (lastPage: PaginatedCommentResponse) => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined;
    },
    getPreviousPageParam: (firstPage: PaginatedCommentResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          CAMPAIGNS_COMMENTS_QUERY_KEY,
          'infinite',
          variables.campaignId,
        ],
      });
    },
  });
}
export function useRemoveComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          CAMPAIGNS_COMMENTS_QUERY_KEY,
          'infinite',
          variables.campaignId,
        ],
      });
    },
  });
}
export function useReportComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          CAMPAIGNS_COMMENTS_QUERY_KEY,
          'infinite',
          variables.campaignId,
        ],
      });
    },
  });
}
