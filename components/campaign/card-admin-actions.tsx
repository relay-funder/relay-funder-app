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

  if (!campaign) {
    return null;
  }

  // Show different controls based on campaign lifecycle stage
  return (
    <div className="w-full space-y-3">
      {/* Contract deployment - Only if not yet deployed */}
      {!campaign.campaignAddress && (
        <div className="flex flex-col space-y-2">
          <CampaignAdminDeployContractButton campaign={campaign} />
        </div>
      )}

      {/* Approval workflow - Only for PENDING_APPROVAL with campaign contract */}
      {isPendingApproval && campaign.campaignAddress && (
        <div className="flex flex-col space-y-2">
          <CampaignAdminApproveButton campaign={campaign} />
        </div>
      )}

      {/* Treasury deployment - Only if campaign has contract but no treasury */}
      {campaign.campaignAddress && !campaign.treasuryAddress && (
        <div className="flex flex-col space-y-2">
          <CampaignAdminDeployButton campaign={campaign} />
        </div>
      )}

      {/* Featured controls */}
      <div className="flex flex-col space-y-2 border-t border-gray-200 pt-2">
        <CampaignAdminFeaturedDialog
          campaign={campaign}
          buttonClassName="w-full"
        />
      </div>

      {/* Management actions - Context-dependent */}
      {(isActive || isDraft) && (
        <div className="flex flex-col space-y-2 border-t border-gray-200 pt-2">
          {/* Disable only for ACTIVE campaigns */}
          {isActive && <CampaignAdminDisableButton campaign={campaign} />}

          {/* Remove only for DRAFT campaigns */}
          {isDraft && <CampaignAdminRemoveButton campaign={campaign} />}
        </div>
      )}
    </div>
  );
}
