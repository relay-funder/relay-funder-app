import { Progress } from '@/components/ui';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { formatAddress } from '@/lib/format-address';
import { cn } from '@/lib/utils';
import { DbCampaign } from '@/types/campaign';
export function CampaignProgress({
  campaign,
  className,
}: {
  campaign: DbCampaign;
  className?: string;
}) {
  const {
    amountRaised,
    amountPending,
    amountPendingFloat,
    amountUnrealized,
    amountGoal,
    progress,
  } = useCampaignStatsFromInstance({ campaign });
  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="text-sm text-muted-foreground"
        title={`Treasury Address ${campaign.treasuryAddress}`}
      >
        {formatAddress(campaign.treasuryAddress ?? '')} Raised
      </div>{' '}
      <div className="flex flex-row justify-between text-3xl font-bold text-green-600">
        <span>{amountRaised}</span>
        {amountPendingFloat !== 0 && (
          <span>
            <span
              className="text-muted-foreground"
              title={`$${amountPending} Pending Confirmation`}
            >
              ({amountUnrealized})
            </span>
          </span>
        )}
      </div>
      <Progress value={progress} className="h-3 rounded-full" />
      <p className="text-gray-600">pledged of {amountGoal} goal</p>
    </div>
  );
}
