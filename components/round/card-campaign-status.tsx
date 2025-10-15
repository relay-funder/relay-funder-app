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
        // Light theme styles - using theme colors, fully opaque
        'border border-quantum bg-quantum text-white':
          status === 'Pending' || status === 'Round: Pending Approval',
        'border border-solar bg-solar text-white': status === 'Round: Rejected',
        'border border-bio bg-bio text-white': status === 'Round: Approved',
        // Dark theme styles for better contrast - using theme colors, fully opaque
        'dark:border-quantum dark:bg-quantum dark:text-white':
          status === 'Pending' || status === 'Round: Pending Approval',
        'dark:border-solar dark:bg-solar dark:text-white':
          status === 'Round: Rejected',
        'dark:border-bio dark:bg-bio dark:text-white':
          status === 'Round: Approved',
      })}
    >
      {status}
    </div>
  );
}
