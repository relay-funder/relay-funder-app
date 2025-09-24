'use client';

import { useAuth } from '@/contexts';
import type { GetRoundResponseInstance } from '@/lib/api/types';
import type { DbCampaign } from '@/types/campaign';
import { Check, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCallback, useState } from 'react';
import {
  useUpdateRoundCampaign,
  useRemoveRoundCampaign,
} from '@/lib/hooks/useRounds';
import { cn } from '@/lib/utils';

interface RoundCampaignAdminControlsProps {
  campaign: DbCampaign;
  round: GetRoundResponseInstance;
}

export function RoundCampaignAdminControls({
  campaign,
  round,
}: RoundCampaignAdminControlsProps) {
  const { isAdmin } = useAuth();
  const { mutateAsync: updateRoundCampaign, isPending: isUpdatePending } =
    useUpdateRoundCampaign();
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
    await removeRoundCampaign({
      campaignId: campaign.id,
      roundId: round.id,
    });
  }, [removeRoundCampaign, campaign.id, round.id]);

  if (!isAdmin) {
    return null;
  }

  const isPending = roundCampaign?.status === 'PENDING';
  const isApproved = roundCampaign?.status === 'APPROVED';
  const isRejected = roundCampaign?.status === 'REJECTED';

  // Admin users can always remove campaigns and toggle approval status
  // Approve/reject buttons are always visible with visual indication of current state

  return (
    <div className="space-y-3 border-t border-gray-200 pt-3">
      <h4 className="text-sm font-medium text-gray-700">Round Actions</h4>

      <div className="flex flex-col gap-2">
        {/* Review Actions - Full width distributed layout with muted colors */}
        <div className="flex w-full gap-1">
          {/* PENDING: Show three buttons distributed across full width */}
          {isPending && (
            <>
              <Button
                onClick={onApprove}
                size="sm"
                disabled={isApproving || isRejecting}
                className={cn(
                  'flex-1 bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200',
                  (isApproving || isRejecting) && 'opacity-50',
                )}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Approving
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Approve
                  </>
                )}
              </Button>

              <Button
                onClick={onReject}
                size="sm"
                disabled={isApproving || isRejecting}
                className={cn(
                  'flex-1 bg-orange-100 px-2 py-1 text-xs text-orange-700 hover:bg-orange-200',
                  (isApproving || isRejecting) && 'opacity-50',
                )}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Rejecting
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" />
                    Reject
                  </>
                )}
              </Button>

              <Button
                onClick={onRemove}
                size="sm"
                disabled={isRemovePending}
                className={cn(
                  'flex-1 bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200',
                  isRemovePending && 'opacity-50',
                )}
              >
                {isRemovePending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Removing
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </>
                )}
              </Button>
            </>
          )}

          {/* APPROVED: Show two buttons distributed across full width */}
          {isApproved && (
            <>
              <Button
                onClick={onReject}
                size="sm"
                disabled={isApproving || isRejecting}
                className={cn(
                  'flex-1 bg-orange-100 px-2 py-1 text-xs text-orange-700 hover:bg-orange-200',
                  (isApproving || isRejecting) && 'opacity-50',
                )}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Rejecting
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3" />
                    Reject
                  </>
                )}
              </Button>

              <Button
                onClick={onRemove}
                size="sm"
                disabled={isRemovePending}
                className={cn(
                  'flex-1 bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200',
                  isRemovePending && 'opacity-50',
                )}
              >
                {isRemovePending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Removing
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </>
                )}
              </Button>
            </>
          )}

          {/* REJECTED: Show two buttons distributed across full width */}
          {isRejected && (
            <>
              <Button
                onClick={onApprove}
                size="sm"
                disabled={isApproving || isRejecting}
                className={cn(
                  'flex-1 bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200',
                  (isApproving || isRejecting) && 'opacity-50',
                )}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Approving
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Approve
                  </>
                )}
              </Button>

              <Button
                onClick={onRemove}
                size="sm"
                disabled={isRemovePending}
                className={cn(
                  'flex-1 bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200',
                  isRemovePending && 'opacity-50',
                )}
              >
                {isRemovePending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Removing
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
