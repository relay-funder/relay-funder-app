import { response, handleError } from '@/lib/api/response';
import { getActiveCategories } from '@/lib/api/categories';

/**
 * GET /api/campaigns/categories
 * Returns only categories that have active campaigns
 */
export async function GET() {
  try {
    const categoriesData = await getActiveCategories();
    return response(categoriesData);
  } catch (error: unknown) {
    return handleError(error);
  }
}
