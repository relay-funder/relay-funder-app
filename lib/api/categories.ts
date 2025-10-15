import { QueryClient } from '@tanstack/react-query';
import { categories } from '@/lib/constant';
import { db } from '@/server/db';

export interface CategoriesResponse {
  categories: Array<{ id: string; name: string; icon: string }>;
  totalActiveCategories: number;
  totalCategories: number;
}

/**
 * Get categories that have active campaigns
 */
export async function getActiveCategories(): Promise<CategoriesResponse> {
  try {
    // Get distinct categories from active campaigns
    const activeCampaignCategories = await db.campaign.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    // Extract category IDs that have active campaigns
    const activeCategoryIds = activeCampaignCategories
      .map((campaign) => campaign.category)
      .filter(Boolean); // Remove any null/undefined values

    // Filter the full category list to only include those with active campaigns
    const categoriesWithCampaigns = categories.filter((category) =>
      activeCategoryIds.includes(category.id),
    );

    return {
      categories: categoriesWithCampaigns,
      totalActiveCategories: categoriesWithCampaigns.length,
      totalCategories: categories.length,
    };
  } catch (error) {
    console.error('Error fetching active categories:', error);
    // Return fallback with no categories
    return {
      categories: [],
      totalActiveCategories: 0,
      totalCategories: categories.length,
    };
  }
}

/**
 * Prefetch active categories for server-side rendering
 */
export async function prefetchActiveCategories(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ['categories', 'active'],
    queryFn: getActiveCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
