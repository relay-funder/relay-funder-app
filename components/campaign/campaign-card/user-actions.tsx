'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DbCampaign } from '@/types/campaign';
import { useAuth } from '@/contexts';
import {
  Trash2,
  Loader2,
  Edit,
  Wallet,
  AlertTriangle,
  Pause,
  Play,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminRemoveCampaign,
  useAdminDisableCampaign,
  useAdminEnableCampaign,
} from '@/lib/hooks/useCampaigns';
import {
  AdminRemoveProcessStates,
  AdminDisableProcessStates,
} from '@/types/admin';
import { WithdrawalDialog } from '../withdrawal-dialog';
import { CampaignAdminDisableButton } from '../admin/disable';
import { useCampaignTreasuryBalance } from '@/hooks/use-treasury-balance';

interface CampaignCardUserActionsProps {
  campaign: DbCampaign;
  onRemove?: () => void;
}

export function CampaignCardUserActions({
  campaign,
  onRemove,
}: CampaignCardUserActionsProps) {
  const { address } = useAuth();
  const isOwner = campaign?.creatorAddress === address;

  // Treasury balance for withdrawal availability
  const { data: treasuryData } = useCampaignTreasuryBalance(campaign?.id);

  // Delete functionality state
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminRemoveProcessStates>('idle');

  // Disable functionality state
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [disableProcessState, setDisableProcessState] =
    useState<keyof typeof AdminDisableProcessStates>('idle');

  const { toast } = useToast();
  const { mutateAsync: adminRemoveCampaign } = useAdminRemoveCampaign();
  const { mutateAsync: adminDisableCampaign } = useAdminDisableCampaign();
  const { mutateAsync: adminEnableCampaign } = useAdminEnableCampaign();

  // Confirmation dialog states
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showEnableConfirm, setShowEnableConfirm] = useState(false);

  const onStateChanged = useCallback(
    (state: keyof typeof AdminRemoveProcessStates) => {
      setProcessState(state);
    },
    [],
  );

  const onDisableStateChanged = useCallback(
    (state: keyof typeof AdminDisableProcessStates) => {
      setDisableProcessState(state);
    },
    [],
  );

  const removeCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onStateChanged('setup');
        await adminRemoveCampaign({
          campaignId: campaign.id,
        });
        onStateChanged('done');
      } catch (error) {
        onStateChanged('failed');
        console.error('Error removing campaign:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to remove campaign',
        );
      }
    },
    [adminRemoveCampaign, onStateChanged],
  );

  const disableCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onDisableStateChanged('setup');
        await adminDisableCampaign({
          campaignId: campaign.id,
        });
        onDisableStateChanged('done');
      } catch (error) {
        onDisableStateChanged('failed');
        console.error('Error disabling campaign:', error);
        setDisableError(
          error instanceof Error ? error.message : 'Failed to disable campaign',
        );
      }
    },
    [adminDisableCampaign, onDisableStateChanged],
  );

  const enableCampaign = useCallback(
    async (campaign: DbCampaign) => {
      try {
        onDisableStateChanged('setup');
        await adminEnableCampaign({
          campaignId: campaign.id,
        });
        onDisableStateChanged('done');
      } catch (error) {
        onDisableStateChanged('failed');
        console.error('Error enabling campaign:', error);
        setDisableError(
          error instanceof Error ? error.message : 'Failed to enable campaign',
        );
      }
    },
    [adminEnableCampaign, onDisableStateChanged],
  );

  const handleRemove = useCallback(async () => {
    setIsDeleting(true);
    await removeCampaign(campaign);
    setIsDeleting(false);
    setShowRemoveConfirm(false);
    onRemove?.();
  }, [removeCampaign, campaign, onRemove]);

  const handleRemoveConfirm = useCallback(() => {
    setShowRemoveConfirm(true);
  }, []);

  const handleDisableConfirm = useCallback(() => {
    setShowDisableConfirm(true);
  }, []);

  const handleDisable = useCallback(async () => {
    setIsDisabling(true);
    await disableCampaign(campaign);
    setIsDisabling(false);
    setShowDisableConfirm(false);
  }, [disableCampaign, campaign]);

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

  useEffect(() => {
    if (disableProcessState === 'done') {
      toast({
        title: 'Success',
        description: 'Campaign has been disabled successfully',
      });
    }
    if (disableProcessState === 'failed') {
      toast({
        title: 'Error',
        description: disableError,
        variant: 'destructive',
      });
    }
  }, [toast, disableProcessState, disableError]);

  // Don't render if user is not the owner
  if (!isOwner) {
    return null;
  }

  // Determine button states based on campaign status
  const canEdit = campaign?.slug && campaign.status !== 'COMPLETED';
  const canRemove =
    campaign.status === 'PENDING_APPROVAL' ||
    campaign.status === 'DRAFT' ||
    campaign.status === 'FAILED';
  const canDisable = campaign.status === 'ACTIVE';
  const canEnable = campaign.status === 'DISABLED';

  // Check if withdrawal should be enabled
  const hasAvailableFunds =
    treasuryData?.balance && parseFloat(treasuryData.balance.available) > 0;
  const canWithdraw =
    campaign?.treasuryAddress &&
    campaign.status === 'ACTIVE' &&
    hasAvailableFunds;

  return (
    <div className="space-y-2 border-t border-border pt-3">
      {/* Two-column grid: Edit (left) + Disable/Remove (right) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left column: Edit button */}
        <Link href={`/campaigns/${campaign.slug}/edit`}>
          <Button
            size="sm"
            variant="outline"
            disabled={!canEdit}
            className="h-8 w-full px-2 py-1 text-xs"
          >
            <Edit className="mr-2 h-3 w-3" />
            Edit
          </Button>
        </Link>

        {/* Right column: Disable or Remove button */}
        {canRemove && (
          <Button
            onClick={handleRemoveConfirm}
            size="sm"
            disabled={isDeleting}
            variant="destructive"
            className="h-8 w-full px-2 py-1 text-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-3 w-3" />
                Remove
              </>
            )}
          </Button>
        )}

        {canDisable && (
          <Button
            onClick={handleDisableConfirm}
            size="sm"
            variant="destructive"
            className="h-8 w-full px-2 py-1 text-xs"
          >
            <Pause className="mr-2 h-3 w-3" />
            Disable
          </Button>
        )}

        {canEnable && (
          <Button
            onClick={() => setShowEnableConfirm(true)}
            size="sm"
            className="h-8 w-full border border-bio bg-bio px-2 py-1 text-xs text-white hover:bg-bio/90"
          >
            <Play className="mr-2 h-3 w-3" />
            Enable
          </Button>
        )}

        {/* Placeholder for right column when neither remove, disable, nor enable */}
        {!canRemove && !canDisable && !canEnable && (
          <div className="h-8 w-full" />
        )}
      </div>

      {/* Full-width Withdrawal button - ALWAYS shown */}
      <WithdrawalDialog
        campaign={campaign}
        trigger={
          <Button
            size="sm"
            variant="outline"
            disabled={!canWithdraw}
            className="h-8 w-full px-2 py-1 text-xs"
          >
            <Wallet className="mr-2 h-3 w-3" />
            Withdraw Funds
          </Button>
        }
      />

      {/* Confirmation Dialogs */}
      {/* Remove Campaign Confirmation */}
      <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Campaign
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this campaign? This action cannot
              be undone. The campaign "{campaign.title}" will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Campaign Confirmation */}
      <Dialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-solar" />
              Disable Campaign
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disable this campaign? This will stop
              accepting new donations and make the campaign inactive. You can
              re-enable it later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisableConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisable}
              disabled={isDisabling}
              className="bg-solar text-white hover:bg-solar/90"
            >
              {isDisabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Campaign Confirmation */}
      <Dialog open={showEnableConfirm} onOpenChange={setShowEnableConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-bio" />
              Enable Campaign
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to re-enable this campaign? This will allow
              the campaign to accept new donations again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnableConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setShowEnableConfirm(false);
                await enableCampaign(campaign);
              }}
              disabled={isDisabling}
              className="bg-bio text-white hover:bg-bio/90"
            >
              {isDisabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                'Enable Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
