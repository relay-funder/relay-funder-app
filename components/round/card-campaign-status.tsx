import { GetRoundResponseInstance } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { type DbCampaign } from '@/types/campaign';

function getRoundCampaignStatus(roundCampaign?: {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  if (roundCampaign?.status === 'PENDING') return 'Pending Approval';
  if (roundCampaign?.status === 'APPROVED') return 'Approved';
  if (roundCampaign?.status === 'REJECTED') return 'Rejected';
  return '';
}

export function RoundCardCampaignStatus({
  campaign,
  round,
}: {
  campaign: DbCampaign;
  round: GetRoundResponseInstance;
}) {
  const roundCampaign = round.roundCampaigns?.find(
    (roundCampaign) => roundCampaign.campaignId === campaign.id,
  );
  const status = getRoundCampaignStatus(roundCampaign);
  return (
    <div
      className={cn('inline-block rounded-full px-3 py-1 text-xs md:text-sm', {
        'bg-orange-100 text-orange-600': status === 'Pending Approval',
        'bg-red-100 text-red-600': status === 'Rejected',
        'bg-green-100 text-green-600': status === 'Approved',
      })}
    >
      {status}
    </div>
  );
}
