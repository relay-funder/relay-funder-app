'use client';

import { DbCampaign } from '@/types/campaign';
import { CampaignAdminApproveButton } from './admin/approve';
import { CampaignAdminRemoveButton } from './admin/remove';
import { CampaignAdminDeployButton } from './admin/deploy';
import { CampaignAdminDisableButton } from './admin/disable';
import { CampaignAdminDeployContractButton } from './admin/deploy-contract';
import { CampaignAdminFeaturedDialog } from './admin/featured-dialog';
import { CampaignAdminClaimTipButton } from './admin/claim-tip';
import { CampaignAdminDisburseFeesButton } from './admin/disburse-fees';
import { CampaignAdminCreateWithdrawalButton } from './admin/create-withdrawal-button';
import { CampaignAdminExecuteWithdrawalButton } from './admin/execute-withdrawal-button';
import { CampaignAdminAuthorizeWithdrawalsButton } from './admin/authorize-withdrawals-button';

export function CampaignCardAdminActions({
  campaign,
}: {
  campaign?: DbCampaign;
}) {
  const isDraft = campaign?.status === 'DRAFT';
  const isPendingApproval = campaign?.status === 'PENDING_APPROVAL';
  const isActive = campaign?.status === 'ACTIVE';
  const isDisabled = campaign?.status === 'DISABLED';
  const isCompleted = campaign?.status === 'COMPLETED';
  const isFailed = campaign?.status === 'FAILED';

  if (!campaign) {
    return null;
  }

  return (
    <div className="space-y-2 border-t border-border pt-3">
      {/* Draft campaigns: Keep existing layout with deploy and remove buttons */}
      {isDraft && (
        <>
          {/* Deploy contract button for drafts without address */}
          {!campaign.campaignAddress && (
            <CampaignAdminDeployContractButton
              campaign={campaign}
              buttonClassName="h-8 w-full px-2 py-1 text-xs bg-black text-white hover:bg-gray-800"
            />
          )}

          {/* Deploy treasury button for campaigns with contract but no treasury */}
          {campaign.campaignAddress && !campaign.treasuryAddress && (
            <CampaignAdminDeployButton
              campaign={campaign}
              buttonClassName="h-8 w-full px-2 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
            />
          )}

          {/* Remove button for draft campaigns */}
          <CampaignAdminRemoveButton
            campaign={campaign}
            buttonClassName="h-8 w-full px-2 py-1 text-xs"
          />
        </>
      )}

      {/* Active campaigns: Feature + Disable buttons side-by-side */}
      {isActive && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <CampaignAdminFeaturedDialog
              campaign={campaign}
              buttonClassName="h-8 w-full px-2 py-1 text-xs bg-muted text-muted-foreground hover:bg-muted/80"
            />
            <CampaignAdminDisableButton
              campaign={campaign}
              buttonClassName="h-8 w-full border border-solar bg-solar px-2 py-1 text-xs text-white hover:bg-solar/90"
            />
          </div>
          {/* Treasury withdrawal authorization for active campaigns */}
          {campaign.treasuryAddress && (
            <div className="mt-2 space-y-2 border-t border-border pt-2">
              {campaign.treasuryWithdrawalsEnabled ? (
                <>
                  <CampaignAdminCreateWithdrawalButton
                    campaign={campaign}
                    buttonClassName="h-8 w-full px-2 py-1 text-xs"
                  />
                  <CampaignAdminExecuteWithdrawalButton
                    campaign={campaign}
                    buttonClassName="h-8 w-full px-2 py-1 text-xs"
                  />
                </>
              ) : (
                <CampaignAdminAuthorizeWithdrawalsButton
                  campaign={campaign}
                  buttonClassName="h-8 w-full px-2 py-1 text-xs"
                />
              )}
              {/* Claim tips and disburse fees for active campaigns past deadline */}
              {campaign.endTime &&
                new Date(campaign.endTime).getTime() < Date.now() && (
                  <div className="grid grid-cols-2 gap-2">
                    <CampaignAdminClaimTipButton
                      campaign={campaign}
                      buttonClassName="h-8 w-full px-2 py-1 text-xs"
                    />
                    <CampaignAdminDisburseFeesButton
                      campaign={campaign}
                      buttonClassName="h-8 w-full px-2 py-1 text-xs"
                    />
                  </div>
                )}
            </div>
          )}
        </>
      )}

      {/* Pending approval campaigns: Approve button + Remove button */}
      {isPendingApproval && (
        <>
          {campaign.campaignAddress && (
            <CampaignAdminApproveButton
              campaign={campaign}
              buttonClassName="h-8 w-full px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            />
          )}
          <CampaignAdminRemoveButton
            campaign={campaign}
            buttonClassName="h-8 w-full px-2 py-1 text-xs"
          />
        </>
      )}

      {/* Disabled campaigns: Enable button + Remove button */}
      {isDisabled && (
        <>
          <CampaignAdminDisableButton
            campaign={campaign}
            buttonClassName="h-8 w-full border border-bio bg-bio px-2 py-1 text-xs text-white hover:bg-bio/90"
          />
          <CampaignAdminRemoveButton
            campaign={campaign}
            buttonClassName="h-8 w-full px-2 py-1 text-xs"
          />
        </>
      )}

      {/* Completed/Failed campaigns: Withdrawal actions + Claim buttons + Remove button */}
      {(isCompleted || isFailed) && (
        <>
          {/* Treasury withdrawal authorization for completed/failed campaigns */}
          {campaign.treasuryAddress && (
            <div className="mb-2 space-y-2">
              {campaign.treasuryWithdrawalsEnabled ? (
                <>
                  <CampaignAdminCreateWithdrawalButton
                    campaign={campaign}
                    buttonClassName="h-8 w-full px-2 py-1 text-xs"
                  />
                  <CampaignAdminExecuteWithdrawalButton
                    campaign={campaign}
                    buttonClassName="h-8 w-full px-2 py-1 text-xs"
                  />
                </>
              ) : (
                <CampaignAdminAuthorizeWithdrawalsButton
                  campaign={campaign}
                  buttonClassName="h-8 w-full px-2 py-1 text-xs"
                />
              )}
              {/* Claim tips and disburse fees */}
              <div className="grid grid-cols-2 gap-2">
                <CampaignAdminClaimTipButton
                  campaign={campaign}
                  buttonClassName="h-8 w-full px-2 py-1 text-xs"
                />
                <CampaignAdminDisburseFeesButton
                  campaign={campaign}
                  buttonClassName="h-8 w-full px-2 py-1 text-xs"
                />
              </div>
            </div>
          )}
          <CampaignAdminRemoveButton
            campaign={campaign}
            buttonClassName="h-8 w-full px-2 py-1 text-xs"
          />
        </>
      )}
    </div>
  );
}
