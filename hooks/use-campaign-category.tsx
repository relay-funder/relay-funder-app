import type { DbCampaign } from '@/types/campaign';
import { categories } from '@/lib/constant';

interface UseCampaignCategoryProps {
  campaign?: DbCampaign;
  categoryId?: string;
}

export function useCampaignCategory({ campaign, categoryId }: UseCampaignCategoryProps) {
  const categoryToFind = campaign?.category ?? categoryId;
  const details = categoryToFind
    ? categories.find((category) => category.id === categoryToFind)
    : null;
  return { details };
}
