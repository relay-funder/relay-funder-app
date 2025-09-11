import { useAuth } from '@/contexts';
import type { GetRoundResponseInstance } from '@/lib/api/types';
import type { DbCampaign } from '@/types/campaign';
import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCallback } from 'react';
import { useUpdateRoundCampaign } from '@/lib/hooks/useRounds';
import { cn } from '@/lib/utils';

export function RoundCardCampaignAdminRejectButton({
  campaign,
  round,
}: {
  campaign: DbCampaign;
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const { mutateAsync: updateRoundCampaign, isPending } =
    useUpdateRoundCampaign();
  const onRejectRoundCampaign = useCallback(async () => {
    await updateRoundCampaign({
      roundId: round.id,
      campaignId: campaign.id,
      status: 'REJECTED',
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
      onClick={onRejectRoundCampaign}
      variant="outline"
      size="icon"
      className={cn(
        'rounded-full',
        isPending && 'opacity-50',
        'mt-4 bg-orange-500 hover:bg-red-700',
      )}
      disabled={isPending}
      title="Reject this Campaign from the Round"
    >
      {isPending ? <Loader2 /> : <XCircle />}
    </Button>
  );
}
