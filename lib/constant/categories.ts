import { Category } from '@/types';

export const categories: readonly [Category, ...Category[]] = [
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'economic-development', name: 'Economic Development', icon: '💼' },
  { id: 'climate-resilience', name: 'Climate Resilience', icon: '🌱' },
  { id: 'emergency-response', name: 'Emergency Response', icon: '🚨' },
];

// Runtime validation: only these category IDs are valid
export const VALID_CATEGORY_IDS = categories.map((cat) => cat.id) as const;
export type ValidCategoryId = (typeof VALID_CATEGORY_IDS)[number];

// Helper function to validate category ID
export function isValidCategoryId(
  categoryId: string,
): categoryId is ValidCategoryId {
  return VALID_CATEGORY_IDS.includes(categoryId as ValidCategoryId);
}

// Helper function to get category by ID with validation
export function getCategoryById(categoryId: string): Category | null {
  if (!isValidCategoryId(categoryId)) {
    console.warn(
      `Invalid category ID detected: "${categoryId}". Only allowed: ${VALID_CATEGORY_IDS.join(', ')}`,
    );
    return null;
  }
  return categories.find((cat) => cat.id === categoryId) || null;
}
