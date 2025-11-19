import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { handleApiErrors } from '@/lib/api/error';
import type { PaginatedResponse } from '@/lib/api/types';
import type { AdminPaymentListItem } from '@/lib/api/adminPayments';

/**
 * Query key root for admin payments lists
 */
export const ADMIN_PAYMENTS_QUERY_KEY = 'admin_payments';

/**
 * Enums aligned with Prisma schema
 */
export type PaymentRefundState =
  | 'NONE'
  | 'REQUESTED'
  | 'PROCESSED'
  | 'APPROVED';
export type PaymentTypeEnum = 'BUY' | 'SELL';
export type PledgeExecutionStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED';

// Re-export the type from the API file to ensure consistency
export type { AdminPaymentListItem } from '@/lib/api/adminPayments';

/**
 * Filter options for admin payments list
 */
export type AdminPaymentsFilters = {
  campaignId?: number;
  userAddress?: string;
  status?: string;
  token?: string;
  refundState?: PaymentRefundState;
  type?: PaymentTypeEnum;
  pledgeExecutionStatus?: PledgeExecutionStatus;
};

interface PaginatedAdminPaymentsResponse extends PaginatedResponse {
  payments: AdminPaymentListItem[];
}

/**
 * Build API URL for admin payments with pagination and filters
 */
function buildAdminPaymentsUrl({
  page,
  pageSize,
  filters,
}: {
  page: number;
  pageSize: number;
  filters?: AdminPaymentsFilters;
}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  if (filters?.campaignId != null) {
    params.set('campaignId', String(filters.campaignId));
  }
  if (filters?.userAddress) {
    params.set('userAddress', filters.userAddress);
  }
  if (filters?.status) {
    params.set('status', filters.status);
  }
  if (filters?.token) {
    params.set('token', filters.token);
  }
  if (filters?.refundState) {
    params.set('refundState', filters.refundState);
  }
  if (filters?.type) {
    params.set('type', filters.type);
  }
  if (filters?.pledgeExecutionStatus) {
    params.set('pledgeExecutionStatus', filters.pledgeExecutionStatus);
  }

  return `/api/admin/payments?${params.toString()}`;
}

/**
 * Fetch a single page of admin payments (internal)
 */
async function fetchAdminPaymentsPage({
  pageParam = 1,
  pageSize = 10,
  filters,
}: {
  pageParam?: number;
  pageSize?: number;
  filters?: AdminPaymentsFilters;
}) {
  const safePage = Number(pageParam) || 1;
  const safePageSize = Math.min(pageSize ?? 10, 10); // API caps at 10
  const url = buildAdminPaymentsUrl({
    page: safePage,
    pageSize: safePageSize,
    filters,
  });
  const response = await fetch(url);
  await handleApiErrors(response, 'Failed to fetch admin payments');
  const data = await response.json();
  // Ensure proper typing of the response
  return data as PaginatedAdminPaymentsResponse;
}

/**
 * Fetch a non-infinite page (array only)
 */
async function fetchAdminPayments({
  page = 1,
  pageSize = 10,
  filters,
}: {
  page?: number;
  pageSize?: number;
  filters?: AdminPaymentsFilters;
}): Promise<AdminPaymentListItem[]> {
  const pageData = await fetchAdminPaymentsPage({
    pageParam: page,
    pageSize,
    filters,
  });
  // Ensure proper typing of the payments array
  return pageData.payments as AdminPaymentListItem[];
}

/**
 * Paged admin payments list
 */
export function useAdminPayments({
  page = 1,
  pageSize = 10,
  filters,
}: {
  page?: number;
  pageSize?: number;
  filters?: AdminPaymentsFilters;
} = {}) {
  const safePage = page > 0 ? page : 1;
  const safePageSize = Math.min(pageSize ?? 10, 10);

  const key: QueryKey = [
    ADMIN_PAYMENTS_QUERY_KEY,
    'page',
    { page: safePage, pageSize: safePageSize, filters: filters ?? {} },
  ];

  return useQuery<AdminPaymentListItem[]>({
    queryKey: key,
    queryFn: () =>
      fetchAdminPayments({
        page: safePage,
        pageSize: safePageSize,
        filters,
      }),
    enabled: true,
  });
}

/**
 * Infinite admin payments list
 */
export function useInfiniteAdminPayments({
  pageSize = 10,
  filters,
}: {
  pageSize?: number;
  filters?: AdminPaymentsFilters;
} = {}) {
  const safePageSize = Math.min(pageSize ?? 10, 10);

  const key: QueryKey = [
    ADMIN_PAYMENTS_QUERY_KEY,
    'infinite',
    safePageSize,
    filters ?? {},
  ];

  return useInfiniteQuery<PaginatedAdminPaymentsResponse, Error>({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) =>
      fetchAdminPaymentsPage({
        pageParam: pageParam as number,
        pageSize: safePageSize,
        filters,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

/**
 * Retry pledge execution for a payment.
 * Used by admin UI when clicking "Retry" button on failed Daimo Pay payments.
 */
async function retryPledgeExecution(paymentId: number) {
  const response = await fetch(
    `/api/admin/payments/${paymentId}/retry-pledge`,
    {
      method: 'POST',
    },
  );
  await handleApiErrors(response, 'Failed to retry pledge execution');
  return response.json();
}

export function useRetryPledgeExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryPledgeExecution,
    onSuccess: () => {
      // Invalidate admin payments queries to refresh the list with updated status
      queryClient.invalidateQueries({ queryKey: [ADMIN_PAYMENTS_QUERY_KEY] });
    },
  });
}
