import { CampaignDetailTabRewardsClient } from './detail-tab-rewards-client';
import { CampaignDisplay } from '@/types/campaign';
import { Web3ContextProvider } from '@/lib/web3/context-provider';

export function CampaignDetailTabRewards({
  campaign,
}: {
  campaign: CampaignDisplay;
}) {
  return (
    <Web3ContextProvider>
      <div className="grid gap-6 md:grid-cols-[60%_40%] lg:grid-cols-[60%_40%]">
        <div className="flex flex-col">
          <CampaignDetailTabRewardsClient
            campaignId={campaign.id.toString()}
            campaignSlug={campaign.slug}
            campaignOwner={campaign.creatorAddress}
          />
        </div>
      </div>
    </Web3ContextProvider>
  );
}
