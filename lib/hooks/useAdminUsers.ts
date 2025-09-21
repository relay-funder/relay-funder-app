import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  GetUserResponse,
  GetUserResponseInstance,
  PatchUserRouteBody,
} from '@/lib/api/types/admin';
import { PaginatedResponse } from '@/lib/api/types';

export const ADMIN_USERS_QUERY_KEY = 'admin_users';
export const ADMIN_USER_QUERY_KEY = 'admin_user';

interface PaginatedUsersResponse extends PaginatedResponse {
  users: GetUserResponseInstance[];
}

/**
  Build URL for admin users list
*/
function buildAdminUsersUrl({
  page,
  pageSize,
  name,
}: {
  page: number;
  pageSize: number;
  name?: string;
}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (name && name.trim().length > 0) {
    params.set('name', name);
  }
  return `/api/admin/users?${params.toString()}`;
}

async function fetchAdminUsersPage({
  pageParam = 1,
  pageSize = 10,
  name,
}: {
  pageParam?: number;
  pageSize?: number;
  name?: string;
}) {
  const safePageSize = Math.min(pageSize ?? 10, 10);
  const url = buildAdminUsersUrl({
    page: Number(pageParam) || 1,
    pageSize: safePageSize,
    name,
  });
  const response = await fetch(url);
  if (!response.ok) {
    let errorMsg = 'Failed to fetch admin users';
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data as PaginatedUsersResponse;
}

async function fetchAdminUsers({
  name,
  page = 1,
  pageSize = 10,
}: {
  name?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageData = await fetchAdminUsersPage({
    pageParam: page,
    pageSize,
    name,
  });
  return pageData.users;
}

/**
  Fetch a specific page of admin users.
  - Respects server-side pageSize limit of 10
  - Supports optional name filter
*/
export function useAdminUsers({
  name,
  page = 1,
  pageSize = 10,
}: {
  name?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const safePage = page > 0 ? page : 1;
  const safePageSize = Math.min(pageSize ?? 10, 10);

  return useQuery({
    queryKey: [
      ADMIN_USERS_QUERY_KEY,
      'page',
      { name: name ?? '', page: safePage, pageSize: safePageSize },
    ],
    queryFn: () =>
      fetchAdminUsers({
        name,
        page: safePage,
        pageSize: safePageSize,
      }),
    enabled: true,
  });
}

/**
  Infinite scrolling hook for admin users.
  - Uses getNextPageParam based on the API pagination metadata
  - Supports optional name filter
*/
export function useInfiniteAdminUsers({
  name,
  pageSize = 10,
}: {
  name?: string;
  pageSize?: number;
} = {}) {
  const safePageSize = Math.min(pageSize ?? 10, 10);

  return useInfiniteQuery<PaginatedUsersResponse, Error>({
    queryKey: [ADMIN_USERS_QUERY_KEY, 'infinite', safePageSize, name ?? ''],
    queryFn: ({ pageParam = 1 }) =>
      fetchAdminUsersPage({
        pageParam: pageParam as number,
        pageSize: safePageSize,
        name,
      }),
    getNextPageParam: (lastPage: PaginatedUsersResponse) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage: PaginatedUsersResponse) =>
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined,
    initialPageParam: 1,
  });
}

// Single user query
async function fetchAdminUser(address: string) {
  const response = await fetch(`/api/admin/users/${address}`);
  if (!response.ok) {
    let errorMsg = 'Failed to fetch user';
    try {
      const err = await response.json();
      errorMsg = err?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const result = await response.json();
  return (result as GetUserResponse).user;
}

export function useAdminUser(address: string) {
  return useQuery({
    queryKey: [ADMIN_USER_QUERY_KEY, address],
    queryFn: () => fetchAdminUser(address),
    enabled: !!address,
  });
}

/**
  Mutations
*/
interface UpdateAdminUserVariables {
  address: string;
  data: PatchUserRouteBody;
}
async function patchAdminUser({ address, data }: UpdateAdminUserVariables) {
  const response = await fetch(`/api/admin/users/${address}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorMsg = 'Failed to update user';
    try {
      const err = await response.json();
      errorMsg = err?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const result = await response.json();
  return result as GetUserResponse;
}

interface UpdateAdminUserFlagsVariables {
  address: string;
  flags: string[];
}
async function patchAdminUserFlags({
  address,
  flags,
}: UpdateAdminUserFlagsVariables) {
  const response = await fetch(`/api/admin/users/${address}/flags`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flags }),
  });
  if (!response.ok) {
    let errorMsg = 'Failed to update user flags';
    try {
      const err = await response.json();
      errorMsg = err?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const result = await response.json();
  return result as GetUserResponse;
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAdminUser,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_USER_QUERY_KEY, variables.address],
      });
    },
  });
}

export function useUpdateAdminUserFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAdminUserFlags,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_USER_QUERY_KEY, variables.address],
      });
    },
  });
}

interface UpdateAdminUserRolesVariables {
  address: string;
  roles: string[];
}
async function patchAdminUserRoles({
  address,
  roles,
}: UpdateAdminUserRolesVariables) {
  const response = await fetch(`/api/admin/users/${address}/roles`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles }),
  });
  if (!response.ok) {
    let errorMsg = 'Failed to update user roles';
    try {
      const err = await response.json();
      errorMsg = err?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const result = await response.json();
  return result as GetUserResponse;
}

export function useUpdateAdminUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAdminUserRoles,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ADMIN_USER_QUERY_KEY, variables.address],
      });
    },
  });
}
