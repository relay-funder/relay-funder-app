# API Integration Playbook

This playbook standardizes how to add a new API + client hook set. It mirrors the established patterns in:
- `app/api/**` (server routes)
- `lib/hooks/useRounds.ts` and `lib/hooks/useAdminUsers.ts` (client hooks)
- `lib/api/types/**` (shared types and zod schemas)

Follow these steps for any new entity (e.g., "users", "rounds", "campaigns", etc.).

## 1. Server Route Design (App Router)

- **Pathing**: place routes under `app/api/<feature>` with nested dynamic segments as needed (e.g., `[id]`, `[address]`, `flags`, `roles`).
- **Auth**: require appropriate roles; call `checkAuth([...])`.
- **Responses**: always `return response(data)` for success and `return handleError(error)` for errors.
- **Validation**: use Zod schemas in `lib/api/types/<feature>` for body parsing/validation.
- **Pagination**: return a paginated envelope with this exact shape:
  - For lists: `{ <plural>: T[], pagination: { currentPage, pageSize, totalPages, totalItems, hasMore } }`
  - Enforce server-side limits (e.g., `pageSize <= 10`) and throw `ApiParameterError` when exceeded.

### Specialized Admin Sub-resources

For flags/roles endpoints:
- Live under `app/api/admin/<plural>/[address]/flags` or `/roles`.
- Validate payload arrays; enforce specific feature flags if needed (e.g., `USER_MODERATOR`).
- Return `{ user: ... }` or `{ item: ... }` to match the rest of admin endpoints.

## 2. Types and Validation

- Add Zod schemas and response interfaces to `lib/api/types/<feature>`.
- Export via the local index and `lib/api/types/index.ts`.
- Reuse existing types where possible (e.g., admin user types).

## 3. Client Hooks (TanStack Query)

Create a dedicated hook file in `lib/hooks/` (e.g., `use<Feature>.ts`).

### Query Keys

```typescript
const FEATURE_QUERY_KEY = 'features';
const FEATURE_ITEM_QUERY_KEY = 'feature';
```

### Paginated Response Interface

```typescript
interface PaginatedResponse {
  items: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}
```

### Fetch Helpers

```typescript
function buildUrl(base: string, q: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (typeof v !== 'undefined' && v !== '') params.set(k, String(v));
  });
  return `${base}?${params.toString()}`;
}

async function fetchPage({ pageParam = 1, pageSize = 10, name }: { pageParam?: number; pageSize?: number; name?: string }) {
  const safePageSize = Math.min(pageSize ?? 10, 10);
  const url = buildUrl('/api/<feature>', { page: pageParam, pageSize: safePageSize, name });
  const res = await fetch(url);
  if (!res.ok) {
    let msg = 'Failed to fetch <feature>';
    try { const e = await res.json(); msg = e?.error || msg; } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as PaginatedResponse;
}

async function fetchItem(idOrAddress: string | number) {
  const url = `/api/<feature>/${idOrAddress}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = 'Failed to fetch <feature> item';
    try { const e = await res.json(); msg = e?.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await res.json();
  return data.item;
}
```

### Hook Exports

```typescript
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFeatures({ name, page = 1, pageSize = 10 } = {}) {
  const safePage = page > 0 ? page : 1;
  const safePageSize = Math.min(pageSize ?? 10, 10);
  return useQuery({
    queryKey: [FEATURE_QUERY_KEY, 'page', { name: name ?? '', page: safePage, pageSize: safePageSize }],
    queryFn: async () => (await fetchPage({ pageParam: safePage, pageSize: safePageSize, name })).items,
    enabled: true,
  });
}

export function useInfiniteFeatures({ name, pageSize = 10 } = {}) {
  const safePageSize = Math.min(pageSize ?? 10, 10);
  return useInfiniteQuery<PaginatedResponse, Error>({
    queryKey: [FEATURE_QUERY_KEY, 'infinite', safePageSize, name ?? ''],
    queryFn: ({ pageParam = 1 }) => fetchPage({ pageParam: pageParam as number, pageSize: safePageSize, name }),
    getNextPageParam: (lastPage) => lastPage.pagination.hasMore ? lastPage.pagination.currentPage + 1 : undefined,
    getPreviousPageParam: (firstPage) => firstPage.pagination.currentPage > 1 ? firstPage.pagination.currentPage - 1 : undefined,
    initialPageParam: 1,
  });
}

export function useFeature(idOrAddress: string | number) {
  return useQuery({
    queryKey: [FEATURE_ITEM_QUERY_KEY, idOrAddress],
    queryFn: () => fetchItem(idOrAddress),
    enabled: !!idOrAddress,
  });
}

export function useUpdateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ idOrAddress, data }) => {
      const res = await fetch(`/api/<feature>/${idOrAddress}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg = 'Failed to update <feature>';
        try { const e = await res.json(); msg = e?.error || msg; } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [FEATURE_QUERY_KEY] });
      qc.invalidateQueries({ queryKey: [FEATURE_ITEM_QUERY_KEY, vars.idOrAddress] });
    },
  });
}
```

## 4. Sub-resource Routes (Flags/Roles)

### Server Route Example

```typescript
import { checkAuth } from '@/lib/api/auth';
import { ApiAuthNotAllowed, ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getUser, updateUserRoles } from '@/lib/api/user';

export async function PATCH(req: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    await checkAuth(['admin']);
    const { address } = await params;
    const { roles } = await req.json();

    const instance = await getUser(address);
    if (!instance) throw new ApiNotFoundError('User not found');
    if (!instance.featureFlags.includes('USER_MODERATOR')) {
      throw new ApiAuthNotAllowed('Admin needs USER_MODERATOR flag');
    }

    if (!Array.isArray(roles)) throw new ApiParameterError('Roles needs to be an array');
    for (const role of roles) {
      if (typeof role !== 'string' || role.trim().length === 0) {
        throw new ApiParameterError('Role must be a nonempty string');
      }
    }

    await updateUserRoles(address, roles);
    const updated = await getUser(address);
    return response({ user: updated! });
  } catch (error: unknown) {
    return handleError(error);
  }
}
```

### Client Hook Example

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateAdminUserRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ address, roles }: { address: string; roles: string[] }) => {
      const res = await fetch(`/api/admin/users/${address}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles }),
      });
      if (!res.ok) {
        let msg = 'Failed to update user roles';
        try { const e = await res.json(); msg = e?.error || msg; } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin_users'] });
      qc.invalidateQueries({ queryKey: ['admin_user', vars.address] });
    },
  });
}
```

## 5. Query Invalidation Strategy

- **List queries**: invalidate `[FEATURE_QUERY_KEY]` and any infinite variants
- **Detail queries**: invalidate `[FEATURE_ITEM_QUERY_KEY, idOrAddress]`
- **Cross-feature**: if updates affect other features (e.g., rounds stats), invalidate their keys too

## 6. Client-side Constraints

- Mirror server constraints client-side (e.g., clamp `pageSize` to `<= 10`)
- Gate queries behind auth context when appropriate
- Encode arrays as comma-separated strings if your API expects that

## 7. Error Handling

- Always try to display API-provided `{ error, details? }` when present
- Fall back to a generic error message otherwise
- Keep mutation error messages actionable but concise

## Checklist

- [ ] Create/extend Zod schemas and types in `lib/api/types/<feature>`
- [ ] Implement `app/api/<feature>` routes (GET list, GET item, PATCH, POST/DELETE as needed)
- [ ] Use `response(...)` and `handleError(...)` consistently
- [ ] Add client hooks in `lib/hooks/use<Feature>.ts`
- [ ] Define `PaginatedResponse` locally in the hook file to match server envelope
- [ ] Implement `useFeatures`, `useInfiniteFeatures`, `useFeature`
- [ ] Implement mutations and invalidate list + detail queries
- [ ] Clamp `pageSize` to server max and use `URLSearchParams` for query strings
- [ ] Test: verify pagination, infinite scrolling, mutations, and cache invalidation
