import type { DbCampaign } from '@/types/campaign';
import { categories } from '@/lib/constant';

export function useCampaignCategory({ campaign }: { campaign?: DbCampaign }) {
  const details = campaign?.category
    ? categories.find((category) => category.id === campaign.category)
    : null;
  return { details };
}
