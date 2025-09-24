import { GetRoundResponseInstance } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { type DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';

function getRoundCampaignStatus(
  roundCampaign?: { status: 'PENDING' | 'APPROVED' | 'REJECTED' },
  isOwnCampaign?: boolean,
  isAdmin?: boolean,
) {
  if (roundCampaign?.status === 'PENDING') {
    // Show "Pending" for user's own campaigns, "Round: Pending Approval" for admin/others
    return isOwnCampaign && !isAdmin ? 'Pending' : 'Round: Pending Approval';
  }
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
  const { address, isAdmin } = useAuth();
  const roundCampaign = round.roundCampaigns?.find(
    (roundCampaign) => roundCampaign.campaignId === campaign.id,
  );
  const isOwnCampaign = campaign.creatorAddress === address;
  const status = getRoundCampaignStatus(roundCampaign, isOwnCampaign, isAdmin);

  return (
    <div
      className={cn('inline-block rounded-full px-2 py-1 text-xs font-medium', {
        'bg-orange-100 text-orange-700':
          status === 'Pending' || status === 'Round: Pending Approval',
        'bg-red-100 text-red-700': status === 'Round: Rejected',
        'bg-green-100 text-green-700': status === 'Round: Approved',
      })}
    >
      {status}
    </div>
  );
}
