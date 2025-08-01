'use server';
import { checkAuth } from '@/lib/api/auth';
import { addCampaignComment } from '@/lib/api/campaigns';
import { type DbCampaign } from '@/types/campaign';
import { revalidatePath } from 'next/cache';

export async function commentCreateFormAction(
  campaign: DbCampaign,
  formData: FormData,
) {
  const session = await checkAuth(['user']);

  const content = formData.get('content') as string;

  try {
    addCampaignComment(campaign.id, content, session.user.address);
    revalidatePath(`/campaigns/${campaign.slug}`);
  } catch (error) {
    console.error('Failed to create comment:', error);
    throw new Error('Failed to create comment');
  }
}
