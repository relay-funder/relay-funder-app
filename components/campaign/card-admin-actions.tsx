import { DbCampaign } from '@/types/campaign';
import { CampaignAdminApproveButton } from './admin/approve';
import { CampaignAdminRemoveButton } from './admin/remove';
import { CampaignAdminDeployButton } from './admin/deploy';
import { CampaignAdminDisableButton } from './admin/disable';

export function CampaignCardAdminActions({
  campaign,
}: {
  campaign?: DbCampaign;
}) {
  if (!campaign) {
    return null;
  }
  return (
    <div className="justify-even w-full flex-row">
      <CampaignAdminApproveButton campaign={campaign} />
      <CampaignAdminRemoveButton campaign={campaign} />
      <CampaignAdminDisableButton campaign={campaign} />
      <CampaignAdminDeployButton campaign={campaign} />
    </div>
  );
}
