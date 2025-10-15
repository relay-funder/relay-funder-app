'use client';
import { type DbCampaign } from '@/types/campaign';
import { CommentList } from '../comment/list';
import { CommentForm } from '@/components/comment/form';

export function CampaignDetailTabComments({
  campaign,
}: {
  campaign: DbCampaign;
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <CommentForm campaign={campaign} />
      <CommentList campaign={campaign} />
    </div>
  );
}
