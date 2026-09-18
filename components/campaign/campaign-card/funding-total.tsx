import { DbCampaign } from '@/types/campaign';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { useCampaignMatchFunding } from '@/lib/hooks/useCampaignMatchFunding';
import { formatUSD } from '@/lib/format-usd';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CampaignCardFundingTotalProps {
  campaign: DbCampaign;
}

// Total raised including round matching, with the split on hover.
// Matching comes from the same round results data the public round pages use.
export function CampaignCardFundingTotal({
  campaign,
}: CampaignCardFundingTotalProps) {
  const { amountRaised, amountRaisedFloat } = useCampaignStatsFromInstance({
    campaign,
  });
  const { matchFunding, isPending } = useCampaignMatchFunding(campaign?.id);

  if (isPending) {
    return <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-xl font-bold text-foreground">
        {formatUSD(amountRaisedFloat + matchFunding)}
      </span>
      {matchFunding > 0 && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-md bg-quantum/10 px-2 py-0.5 font-medium text-quantum"
                onClick={(event) => event.preventDefault()}
              >
                with matching
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="grid grid-cols-[auto_auto] gap-x-4 tabular-nums">
                <span>Donations</span>
                <span className="text-right">{amountRaised}</span>
                <span>Matching</span>
                <span className="text-right">{formatUSD(matchFunding)}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
