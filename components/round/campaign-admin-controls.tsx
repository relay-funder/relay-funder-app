'use client';

import { useAuth } from '@/contexts';
import type { GetRoundResponseInstance } from '@/lib/api/types';
import type { DbCampaign } from '@/types/campaign';
import { Check, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCallback, useRef, useState } from 'react';
import {
  useUpdateRoundCampaign,
  useRemoveRoundCampaign,
} from '@/lib/hooks/useRounds';
import { cn } from '@/lib/utils';
import { debugComponentData as debug } from '@/lib/debug';
import { useConfirm } from '@/hooks/use-confirm';
import { useToast } from '@/hooks/use-toast';

interface RoundCampaignAdminControlsProps {
  campaign: DbCampaign;
  round: GetRoundResponseInstance;
}

export function RoundCampaignAdminControls({
  campaign,
  round,
}: RoundCampaignAdminControlsProps) {
  const attemptedRef = useRef(false);
  const { isAdmin } = useAuth();
  const { confirm } = useConfirm();
  const { mutateAsync: updateRoundCampaign } = useUpdateRoundCampaign();
  const { mutateAsync: removeRoundCampaign, isPending: isRemovePending } =
    useRemoveRoundCampaign();

  // Individual loading states for each action
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const roundCampaign = round.roundCampaigns?.find(
    (rc) => rc.campaignId === campaign.id,
  );

  const onApprove = useCallback(async () => {
    setIsApproving(true);
    try {
      await updateRoundCampaign({
        roundId: round.id,
        campaignId: campaign.id,
        status: 'APPROVED',
      });
    } finally {
      setIsApproving(false);
    }
  }, [updateRoundCampaign, campaign.id, round.id]);

  const onReject = useCallback(async () => {
    setIsRejecting(true);
    try {
      await updateRoundCampaign({
        roundId: round.id,
        campaignId: campaign.id,
        status: 'REJECTED',
      });
    } finally {
      setIsRejecting(false);
    }
  }, [updateRoundCampaign, campaign.id, round.id]);

  const onRemove = useCallback(async () => {
    try {
      attemptedRef.current = false;
      await confirm({
        title: 'Are you absolutely sure?',
        description: (
          <>
            This action cannot be undone. This will permanently remove the
            campaign &quot;
            <span className="font-semibold">
              {campaign?.title ?? 'Untitled Campaign'}
            </span>
            &quot; from the round &quot;
            <span className="font-semibold">
              {round.title ?? 'Untitled Round'}
            </span>
            &quot;.
          </>
        ),
        onConfirm: async () => {
          await removeRoundCampaign({
            campaignId: campaign.id,
            roundId: round.id,
          });
        },
        confirmText: 'Remove',
        confirmVariant: 'destructive',
      });
      // Log successful removal for tracking
      debug &&
        console.log('Admin removed campaign from round:', {
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          roundId: round.id,
          roundTitle: round.title,
          timestamp: new Date().toISOString(),
        });

      // The campaign is now available for re-addition since the relationship is deleted
    } catch (error) {
      console.error('Failed to remove campaign from round:', error);
      throw error; // Re-throw to let the UI handle the error
    }
  }, [
    removeRoundCampaign,
    campaign.id,
    campaign.title,
    round.id,
    round.title,
    confirm,
  ]);

  if (!isAdmin) {
    return null;
  }

  const isPending = roundCampaign?.status === 'PENDING';
  const isApproved = roundCampaign?.status === 'APPROVED';
  const isRejected = roundCampaign?.status === 'REJECTED';

  if (new Date() > new Date(round.endTime)) {
    return null;
  }
  return (
    <div className="w-full space-y-3">
      {/* Horizontal divider for visual separation */}
      <div className="border-t border-gray-200"></div>

      {/* Primary Actions Row - Approve/Reject actions */}
      <div className="flex w-full gap-2">
        {/* Approve button - Main action, use black styling */}
        {(isPending || isRejected) && (
          <div className="flex-1">
            <Button
              onClick={onApprove}
              size="sm"
              disabled={isApproving || isRejecting}
              className={cn(
                'w-full bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800',
                (isApproving || isRejecting) && 'opacity-50',
              )}
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </div>
        )}

        {/* Reject button - Secondary action, use gray styling */}
        {(isPending || isApproved) && (
          <div className="flex-1">
            <Button
              onClick={onReject}
              size="sm"
              disabled={isApproving || isRejecting}
              className={cn(
                'w-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200',
                (isApproving || isRejecting) && 'opacity-50',
              )}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Secondary Actions Row - Remove action */}
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <Button
            onClick={onRemove}
            size="sm"
            disabled={isRemovePending}
            className={cn(
              'w-full bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200',
              isRemovePending && 'opacity-50',
            )}
          >
            {isRemovePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
