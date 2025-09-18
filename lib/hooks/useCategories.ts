import { useQuery } from '@tanstack/react-query';
import { getActiveCategories, CategoriesResponse } from '@/lib/api/categories';

async function fetchActiveCategories(): Promise<CategoriesResponse> {
  // Try to fetch from API route (client-side) if server-side data is not available
  const response = await fetch('/api/campaigns/categories');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch active categories');
  }
  return response.json();
}

/**
 * Hook to fetch categories that have active campaigns
 * Will use prefetched server-side data when available
 */
export function useActiveCategories() {
  return useQuery({
    queryKey: ['categories', 'active'],
    queryFn: fetchActiveCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
