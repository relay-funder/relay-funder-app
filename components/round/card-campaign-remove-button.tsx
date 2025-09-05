'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { AdminRemoveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Link, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { useRemoveRoundCampaign } from '@/lib/hooks/useRounds';
import { useAuth } from '@/contexts';
export function RoundCardCampaignRemoveButton({
  campaign,
  round,
}: {
  campaign: DbCampaign;
  round: GetRoundResponseInstance;
}) {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminRemoveProcessStates>('idle');

  const { toast } = useToast();
  const { mutateAsync: removeRoundCampaign } = useRemoveRoundCampaign();

  const onStateChanged = useCallback(
    (state: keyof typeof AdminRemoveProcessStates) => {
      setProcessState(state);
    },
    [],
  );

  const removeCampaign = useCallback(
    async (campaign: DbCampaign, round: GetRoundResponseInstance) => {
      try {
        onStateChanged('setup');
        await removeRoundCampaign({
          campaignId: campaign.id,
          roundId: round.id,
        });

        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        console.error('Error approving campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to remove campaign',
        );
      }
    },
    [removeRoundCampaign, onStateChanged],
  );
  const onRemove = useCallback(async () => {
    setIsLoading(true);
    await removeCampaign(campaign, round);
    setIsLoading(false);
  }, [removeCampaign, campaign, round]);

  useEffect(() => {
    if (processState === 'done') {
      toast({
        title: 'Success',
        description: 'Campaign has been removed successfully',
      });
    }
    if (processState === 'failed') {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [toast, processState, error]);
  const roundCampaign = round.roundCampaigns?.find(
    (roundCampaign) => roundCampaign.campaignId === campaign.id,
  );
  if (
    !isAdmin &&
    roundCampaign?.status !== 'PENDING' &&
    roundCampaign?.status !== 'REJECTED'
  ) {
    return null;
  }
  return (
    <Button
      onClick={onRemove}
      variant="outline"
      size="icon"
      className={cn(
        'rounded-full',
        isLoading && 'opacity-50',
        'mt-4 bg-red-600 hover:bg-red-700',
      )}
      disabled={isLoading}
      title="Remove this Campaign from the Round"
    >
      {isLoading ? <Loader2 /> : <Link />}
    </Button>
  );
}
