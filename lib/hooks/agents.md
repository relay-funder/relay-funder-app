This directory contains API hooks.

those hooks are for components to interact with the /api endpoints using tanstack/query

the pattern of the hooks is simple

one or more query-key-constants if applicable
a useWhatever function that wraps and configures useQuery or useMutation
a fetch/update/get function that wraps the actual queryFn

do not implement transformation or other business logic here,
business logic belongs to /app/api/routes that calls methods in /lib/api
transformations needed for components belong to /hooks

```
should be shared with the route that produces the data
ideally thats a zod-schema so instead of just casting we can schema.parse in fetchWhatever

import ApiResponseType from '@/lib/api/types'
const WHATEVER_KEY = 'whatever';

// Fetch via API
async function fetchWhatever(
  param?: string | null,
) {
  if (!param) {
    throw new ApiParameterError('Invalid parameter (be specific for developers)');
  }
  const response = await fetch(
    `/api/whatever/${param}`,
  );
  await handleApiErrors(response, 'Failed to fetch whatever');
  const data = await response.json()
  return data as ApiResponseType;
}

export function useTreasuryBalance(param?: string | null) {
  return useQuery({
    queryKey: [TREASURY_BALANCE_QUERY_KEY, treasuryAddress],
    // avoid complex queryFn. prefer to handle logic in fetch-function
    queryFn: async () => fetchTreasuryBalance(treasuryAddress),
    // define as needed, avoid defining what should be a default
    enabled: !!param,
    staleTime: 30000,
    // prefer discussion with developer why it is not possible to depend on
    // invalidation/window-focus-refresh
    refetchInterval: 60000,
  });
}
