'use client';

import { DbCampaign } from '@/types/campaign';
import { CampaignAdminApproveButton } from './admin/approve';
import { CampaignAdminRemoveButton } from './admin/remove';
import { CampaignAdminDeployButton } from './admin/deploy';
import { CampaignAdminDisableButton } from './admin/disable';
import { CampaignAdminDeployContractButton } from './admin/deploy-contract';
import { CampaignAdminFeaturedDialog } from './admin/featured-dialog';

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
    <div className="w-full space-y-3">
      {/* Horizontal divider for visual separation */}
      <div className="border-t border-gray-200"></div>

      {/* Primary Actions Row - Contract/Treasury (Approve moved to secondary row) */}
      {(!campaign.campaignAddress ||
        (campaign.campaignAddress &&
          !campaign.treasuryAddress &&
          !isPendingApproval)) && (
        <div className="flex w-full gap-2">
          {!campaign.campaignAddress && (
            <div className="flex-1">
              <CampaignAdminDeployContractButton
                campaign={campaign}
                buttonClassName="w-full bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              />
            </div>
          )}
          {campaign.campaignAddress &&
            !campaign.treasuryAddress &&
            !isPendingApproval && (
              <div className="flex-1">
                <CampaignAdminDeployButton
                  campaign={campaign}
                  buttonClassName="w-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                />
              </div>
            )}
        </div>
      )}

      {/* Secondary Actions Row - Feature/Disable/Remove */}
      <div className="flex w-full gap-2">
        {/* Approve button - Show when pending approval */}
        {isPendingApproval && campaign.campaignAddress && (
          <div className="flex-1">
            <CampaignAdminApproveButton
              campaign={campaign}
              buttonClassName="w-full bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            />
          </div>
        )}

        {/* Feature button - Always available */}
        <div className="flex-1">
          <CampaignAdminFeaturedDialog
            campaign={campaign}
            buttonClassName="w-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          />
        </div>

        {/* Status-based action */}
        {(isActive || isDisabled || isPendingApproval) && (
          <div className="flex-1">
            <CampaignAdminDisableButton
              campaign={campaign}
              buttonClassName={`w-full px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            />
          </div>
        )}

        {(isDraft || isCompleted || isFailed) && (
          <div className="flex-1">
            <CampaignAdminRemoveButton
              campaign={campaign}
              buttonClassName="w-full bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
