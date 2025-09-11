import { useAuth } from '@/contexts';
import type { GetRoundResponseInstance } from '@/lib/api/types';
import type { DbCampaign } from '@/types/campaign';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCallback } from 'react';
import { useUpdateRoundCampaign } from '@/lib/hooks/useRounds';
import { cn } from '@/lib/utils';

export function RoundCardCampaignAdminApproveButton({
  campaign,
  round,
}: {
  campaign: DbCampaign;
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const { mutateAsync: updateRoundCampaign, isPending } =
    useUpdateRoundCampaign();
  const onApproveRoundCampaign = useCallback(async () => {
    await updateRoundCampaign({
      roundId: round.id,
      campaignId: campaign.id,
      status: 'APPROVED',
    });
  }, [updateRoundCampaign, campaign, round]);

  const roundCampaign = round.roundCampaigns?.find(
    (roundCampaign) => roundCampaign.campaignId === campaign.id,
  );
  if (!isAdmin || roundCampaign?.status !== 'PENDING') {
    return null;
  }
  return (
    <Button
      onClick={onApproveRoundCampaign}
      variant="outline"
      size="icon"
      className={cn(
        'rounded-full',
        isPending && 'opacity-50',
        'mt-4 bg-green-600 hover:bg-red-700',
      )}
      disabled={isPending}
      title="Approve this Campaign for the Round"
    >
      {isPending ? <Loader2 /> : <CheckCircle />}
    </Button>
  );
}
