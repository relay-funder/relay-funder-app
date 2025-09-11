import { useCampaignRounds } from '@/hooks/use-campaign-rounds';
import type { DbCampaign } from '@/types/campaign';
import { Rocket } from 'lucide-react';

export function CampaignRoundsIndicator({
  campaign,
}: {
  campaign?: DbCampaign;
}) {
  const { title: roundTitle, hasRounds } = useCampaignRounds({ campaign });
  if (!hasRounds) {
    return null;
  }
  return (
    <div className="align flex self-end" title={roundTitle}>
      <Rocket />
    </div>
  );
}
