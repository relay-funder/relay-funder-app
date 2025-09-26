'use client';

import { useCampaignCategory } from '@/hooks/use-campaign-category';

interface CategoryProps {
  categoryId?: string | null;
  className?: string;
}

export function Category({ categoryId, className = '' }: CategoryProps) {
  const { details: categoryDetails } = useCampaignCategory({
    campaign: categoryId ? { category: categoryId } : undefined,
  });

  if (!categoryDetails) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base">{categoryDetails.icon}</span>
      <span className="font-medium">{categoryDetails.name}</span>
    </div>
  );
}
