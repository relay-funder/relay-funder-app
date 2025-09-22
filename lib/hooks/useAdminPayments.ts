import {
  useQuery,
  useInfiniteQuery,
  type QueryKey,
} from '@tanstack/react-query';
import type { PaginatedResponse } from '@/lib/api/types';

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

/**
 * Admin payments list item (matches /api/admin/payments response shape)
 */
export type AdminPaymentListItem = {
  id: number;
  amount: string;
  token: string;
  status: string;
  type: PaymentTypeEnum;
  transactionHash?: string | null;
  isAnonymous: boolean;
  createdAt: string; // ISO from API
  updatedAt: string; // ISO from API
  campaignId: number;
  userId: number;
  externalId?: string | null;
  metadata?: unknown;
  provider?: string | null;
  refundState: PaymentRefundState;

  campaign: {
    id: number;
    title: string;
    slug: string;
  };
  user: {
    id: number;
    address: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  RoundContribution: Array<{
    id: number;
    createdAt: string;
    humanityScore: number;
    roundCampaign: {
      id: number;
      Round: { id: number; title: string; status: string };
      Campaign: { id: number; title: string; slug: string };
    };
  }>;
};

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
  if (!response.ok) {
    let msg = 'Failed to fetch admin payments';
    try {
      const err = await response.json();
      msg = err?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  const data = (await response.json()) as PaginatedAdminPaymentsResponse;
  return data;
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
}) {
  const pageData = await fetchAdminPaymentsPage({
    pageParam: page,
    pageSize,
    filters,
  });
  return pageData.payments;
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

  return useQuery({
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
