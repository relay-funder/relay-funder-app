import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { CampaignCardDisplayOptions } from './types';
import { CampaignCardActions } from './actions';
import { useAuth } from '@/contexts';
import { Trash2, Loader2, Edit, Wallet } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminRemoveCampaign } from '@/lib/hooks/useCampaigns';
import { AdminRemoveProcessStates } from '@/types/admin';
import { cn } from '@/lib/utils';
import { WithdrawalDialog } from '../withdrawal-dialog';

interface CampaignStatusInfo {
  status: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  description: string;
  canDonate: boolean;
}

interface CampaignCardFooterProps {
  campaign: DbCampaign;
  displayOptions: CampaignCardDisplayOptions;
  adminMode: boolean;
  showButtons: boolean;
  customButtons?: React.ReactNode;
  canDonate: boolean;
  campaignStatusInfo: CampaignStatusInfo;
  // Round-specific props
  round?: GetRoundResponseInstance;
  roundCampaign?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    id: number;
    campaignId: number;
  };
  roundAdminFooterControls?: React.ReactNode;
  // Card type for context-aware rendering
  cardType?: 'standard' | 'dashboard' | 'admin' | 'round' | 'round-minimal';
}

export function CampaignCardFooter({
  campaign,
  displayOptions,
  adminMode,
  showButtons,
  customButtons,
  canDonate,
  campaignStatusInfo,
  roundAdminFooterControls,
  cardType = 'standard',
}: CampaignCardFooterProps) {
  const { address } = useAuth();
  const isOwner = campaign?.creatorAddress === address;

  // Delete functionality state
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processState, setProcessState] =
    useState<keyof typeof AdminRemoveProcessStates>('idle');
  const { toast } = useToast();
  const { mutateAsync: adminRemoveCampaign } = useAdminRemoveCampaign();

  const onStateChanged = useCallback(
    (state: keyof typeof AdminRemoveProcessStates) => {
      setProcessState(state);
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

  const onRemove = useCallback(async () => {
    setIsDeleting(true);
    await removeCampaign(campaign);
    setIsDeleting(false);
  }, [removeCampaign, campaign]);

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

  // Check if delete button should be shown (same conditions as original CampaignRemoveButton)
  const shouldShowDeleteButton =
    displayOptions.showRemoveButton &&
    (campaign.status === 'FAILED' ||
      campaign.status === 'COMPLETED' ||
      campaign.status === 'DRAFT' ||
      campaign.status === 'PENDING_APPROVAL');

  // Check if edit button should be shown (for campaign owner only)
  const shouldShowEditButton =
    displayOptions.showEditButton && isOwner && campaign?.slug;

  // Check if withdrawal button should be shown (for campaign owner only, active campaigns with treasury)
  const shouldShowWithdrawalButton =
    displayOptions.showWithdrawalButton &&
    isOwner &&
    campaign?.treasuryAddress &&
    campaign.status === 'ACTIVE';

  // Show footer only for essential actions and controls
  const hasEssentialFooterContent =
    shouldShowEditButton ||
    shouldShowDeleteButton ||
    shouldShowWithdrawalButton ||
    (displayOptions.showRoundAdminFooterControls && roundAdminFooterControls) ||
    customButtons ||
    (adminMode && displayOptions.showCampaignAdminActions && showButtons) ||
    (campaign?.rounds &&
      campaign?.rounds?.length > 0 &&
      (adminMode || isOwner) &&
      cardType !== 'standard');

  if (!hasEssentialFooterContent) {
    return null; // No footer for clean design
  }

  return (
    <CardFooter className="p-4 pt-0">
      <div className="w-full">
        {/* Round Applications - Show for campaign owners and admins, but hide on homepage */}
        {campaign?.rounds &&
          campaign?.rounds?.length > 0 &&
          (adminMode || isOwner) &&
          cardType !== 'standard' && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-foreground">
                Round Applications:
              </h4>
              <ul className="space-y-1">
                {campaign.rounds.map((round: GetRoundResponseInstance) => (
                  <li
                    key={round.id}
                    className="border-l-2 border-accent pl-2 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-between">
                      <span>{round.title}</span>
                      {round.recipientStatus && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                            round.recipientStatus === 'APPROVED'
                              ? 'bg-bio/10 text-bio border border-bio/20'
                              : round.recipientStatus === 'REJECTED'
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-solar/10 text-solar border border-solar/20'
                          }`}
                        >
                          {round.recipientStatus === 'APPROVED'
                            ? 'approved'
                            : round.recipientStatus === 'REJECTED'
                              ? 'rejected'
                              : 'pending'}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Round admin controls - only render if controls exist */}
        {displayOptions.showRoundAdminFooterControls &&
          roundAdminFooterControls && <div>{roundAdminFooterControls}</div>}

        {/* Campaign admin actions - only when explicitly enabled */}
        {showButtons &&
          adminMode &&
          displayOptions.showCampaignAdminActions && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Campaign Actions
              </h4>
              <CampaignCardActions
                campaign={campaign}
                showButtons={showButtons}
                customButtons={customButtons}
                adminMode={adminMode}
                displayOptions={displayOptions}
                canDonate={canDonate}
                campaignStatusInfo={campaignStatusInfo}
              />
            </div>
          )}

        {/* Creator controls: Edit, Withdraw, Delete */}
        {(shouldShowEditButton ||
          shouldShowWithdrawalButton ||
          shouldShowDeleteButton) && (
          <div className="border-t border-border pt-3">
            <div className="flex gap-2">
              {/* Edit button */}
              {shouldShowEditButton && (
                <Link
                  href={`/campaigns/${campaign.slug}/edit`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      'w-full px-2 py-1 text-xs',
                    )}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
              )}

              {/* Withdrawal button */}
              {shouldShowWithdrawalButton && (
                <div className="flex-1">
                  <WithdrawalDialog
                    campaign={campaign}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          'w-full px-2 py-1 text-xs',
                        )}
                      >
                        <Wallet className="mr-2 h-3 w-3" />
                        Withdraw
                      </Button>
                    }
                  />
                </div>
              )}

              {/* Delete button */}
              {shouldShowDeleteButton && (
                <Button
                  onClick={onRemove}
                  size="sm"
                  disabled={isDeleting}
                  variant="destructive"
                  className={cn(
                    'flex-1 px-2 py-1 text-xs',
                    isDeleting && 'opacity-50',
                  )}
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
            </div>
          </div>
        )}
      </div>
    </CardFooter>
  );
}
