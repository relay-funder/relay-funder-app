import { CardFooter } from '@/components/ui/card';
import { DbCampaign } from '@/types/campaign';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { CampaignCardDisplayOptions } from './types';
import { CampaignCardActions } from './actions';
import { useAuth } from '@/contexts';
import { CampaignCardUserActions } from './user-actions';

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

  // Show footer only for essential actions and controls
  const hasEssentialFooterContent =
    shouldShowEditButton ||
    shouldShowDeleteButton ||
    displayOptions.showWithdrawalButton ||
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
            <div className="mb-4 space-y-2">
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
                              ? 'border border-bio/20 bg-bio/10 text-bio'
                              : round.recipientStatus === 'REJECTED'
                                ? 'border border-destructive/20 bg-destructive/10 text-destructive'
                                : 'border border-solar/20 bg-solar/10 text-solar'
                          }`}
                        >
                          {round.recipientStatus === 'APPROVED'
                            ? 'Approved'
                            : round.recipientStatus === 'REJECTED'
                              ? 'Rejected'
                              : 'Pending'}
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

        {/* User actions for campaign owners */}
        {displayOptions.showWithdrawalButton && (
          <CampaignCardUserActions
            campaign={campaign}
            onRemove={() => {
              // Handle remove callback if needed
            }}
          />
        )}
      </div>
    </CardFooter>
  );
}
