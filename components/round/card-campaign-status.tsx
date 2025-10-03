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
        // Light theme styles
        'bg-solar/10 text-solar border border-solar/20':
          status === 'Pending' || status === 'Round: Pending Approval',
        'bg-destructive/10 text-destructive border border-destructive/20': status === 'Round: Rejected',
        'bg-bio text-white border border-bio': status === 'Round: Approved',
        // Dark theme styles for better contrast
        'dark:bg-solar/20 dark:text-solar dark:border-solar/40':
          status === 'Pending' || status === 'Round: Pending Approval',
        'dark:bg-destructive/20 dark:text-destructive dark:border-destructive/40': status === 'Round: Rejected',
        'dark:bg-bio dark:text-white dark:border-bio': status === 'Round: Approved',
      })}
    >
      {status}
    </div>
  );
}
