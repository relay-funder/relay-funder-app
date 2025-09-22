import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { AdminUserOverviewResponse } from '@/lib/api/types';

export type AdminUserOverviewFetchOptions = {
  baseUrl?: string;
  cookie?: string;
  init?: RequestInit;
};

export const ADMIN_USER_OVERVIEW_QUERY_KEY = 'admin_user_overview';

/**
 * Build the overview endpoint URL for a given user address.
 */
function buildOverviewUrl(address: string, baseUrl?: string) {
  const path = `/api/admin/users/${encodeURIComponent(address)}/overview`;
  return baseUrl ? `${baseUrl}${path}` : path;
}

/**
 * Fetch aggregated admin user overview data.
 * Expects the caller to pass a non-empty address.
 */
async function fetchAdminUserOverview(
  address: string,
  opts?: AdminUserOverviewFetchOptions,
): Promise<AdminUserOverviewResponse> {
  const url = buildOverviewUrl(address, opts?.baseUrl);
  const init = opts?.init ?? {};
  const headers = {
    ...(init.headers as Record<string, string> | undefined),
    ...(opts?.cookie ? { cookie: opts.cookie } : {}),
  } as Record<string, string> | undefined;

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let message = 'Failed to fetch admin user overview';
    try {
      const err = await res.json();
      message = err?.error || message;
    } catch {
      // ignore JSON parse error and use default message
    }
    throw new Error(message);
  }
  return (await res.json()) as AdminUserOverviewResponse;
}

export async function prefetchAdminUserOverview(
  queryClient: QueryClient,
  address: string,
  options?: AdminUserOverviewFetchOptions,
) {
  const addr = address?.trim();
  if (!addr) return;
  await queryClient.prefetchQuery({
    queryKey: [ADMIN_USER_OVERVIEW_QUERY_KEY, addr],
    queryFn: () => fetchAdminUserOverview(addr, options),
  });
}

/**
 * React Query hook to load the admin user overview data for a given address.
 *
 * Example:
 * const { data, isLoading, error } = useAdminUserOverview(address);
 */
export function useAdminUserOverview<TData = AdminUserOverviewResponse>(
  address: string | undefined,
  options?: Omit<
    UseQueryOptions<AdminUserOverviewResponse, Error, TData>,
    'queryKey' | 'queryFn' | 'enabled'
  > & { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    typeof address === 'string' &&
    address.trim().length > 0;

  return useQuery<AdminUserOverviewResponse, Error, TData>({
    queryKey: [ADMIN_USER_OVERVIEW_QUERY_KEY, address],
    queryFn: () => fetchAdminUserOverview(address!.trim()),
    enabled,
    // Allow consumers to override defaults (e.g., staleTime, select, etc.)
    ...(options as object),
  });
}
