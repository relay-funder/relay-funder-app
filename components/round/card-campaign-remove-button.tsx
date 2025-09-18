'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { AdminRemoveProcessStates } from '@/types/admin';
import type { DbCampaign } from '@/types/campaign';
import { Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { useRemoveRoundCampaign } from '@/lib/hooks/useRounds';
import { useAuth } from '@/contexts';
export function RoundCardCampaignRemoveButton({
  campaign,
  round,
  children,
}: {
  campaign?: DbCampaign;
  round: GetRoundResponseInstance;
  children?: React.ReactNode;
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
  const onRemove = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (!campaign) {
        return;
      }
      setIsLoading(true);
      await removeCampaign(campaign, round);
      setIsLoading(false);
    },
    [removeCampaign, campaign, round],
  );

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
  const roundCampaign = useMemo(() => {
    return round.roundCampaigns?.find(
      (roundCampaign) =>
        roundCampaign.campaignId && roundCampaign.campaignId === campaign?.id,
    );
  }, [campaign, round]);
  if (!campaign) {
    console.warn('remove button without campaign');
    return null;
  }
  if (
    !isAdmin &&
    roundCampaign?.status !== 'PENDING' &&
    roundCampaign?.status !== 'REJECTED'
  ) {
    console.warn(
      'remove button without campaign in correct state',
      roundCampaign,
    );
    return null;
  }
  if (children) {
    return (
      <Button
        variant="destructive"
        className={cn(isLoading && 'opacity-50')}
        disabled={isLoading}
        onClick={onRemove}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button
      onClick={onRemove}
      variant="outline"
      size="sm"
      className={cn(
        'h-8 w-8 rounded-full border-0 shadow-md',
        isLoading && 'opacity-50',
        'bg-red-600 text-white hover:bg-red-700',
      )}
      disabled={isLoading}
      title="Remove this Campaign from the Round"
    >
      {children ? (
        isLoading && (
          <>
            <Loader2 />
            {children}
          </>
        )
      ) : isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
