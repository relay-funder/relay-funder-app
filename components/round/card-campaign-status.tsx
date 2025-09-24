import { GetRoundResponseInstance } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { type DbCampaign } from '@/types/campaign';

function getRoundCampaignStatus(roundCampaign?: {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}) {
  if (roundCampaign?.status === 'PENDING') return 'Round: Pending Approval';
  if (roundCampaign?.status === 'APPROVED') return 'Round: Approved';
  if (roundCampaign?.status === 'REJECTED') return 'Round: Rejected';
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
      className={cn('inline-block rounded-full px-2 py-1 text-xs font-medium', {
        'bg-orange-100 text-orange-700': status === 'Round: Pending Approval',
        'bg-red-100 text-red-700': status === 'Round: Rejected',
        'bg-green-100 text-green-700': status === 'Round: Approved',
      })}
    >
      {status}
    </div>
  );
}
