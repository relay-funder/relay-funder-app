import { CampaignDetailTabRewardsClient } from './detail-tab-rewards-client';
import { CampaignDisplay } from '@/types/campaign';
export function CampaignDetailTabRewards({
  campaign,
}: {
  campaign: CampaignDisplay;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[60%_40%] lg:grid-cols-[60%_40%]">
      <div className="flex flex-col">
        <CampaignDetailTabRewardsClient
          campaignId={campaign.id.toString()}
          campaignSlug={campaign.slug}
          campaignOwner={campaign.creatorAddress}
        />
      </div>
    </div>
  );
}
