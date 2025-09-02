'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { type DbCampaign } from '@/types/campaign';
import { CampaignDetailTabAbout } from './detail-tab-about';
import { CampaignDetailTabRewards } from './detail-tab-rewards';
import { CampaignDetailTabUpdates } from './detail-tab-updates';
import { CampaignDetailTabComments } from './detail-tab-comments';
import { CampaignDetailTabTransactions } from './detail-tab-transactions';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
const TAB_TRIGGER_CLASS_NAMES =
  'rounded-none data-[state=active]:border-b-2 data-[state=active]:border-green-600';
export function CampaignDetailTabs({ campaign }: { campaign: DbCampaign }) {
  const { contributorCount, contributorPendingCount } =
    useCampaignStatsFromInstance({ campaign });
  return (
    <div className="">
      <Tabs defaultValue="campaign" className="min-h-[380px] space-y-8">
        <TabsList className="h-12 w-full justify-start overflow-x-auto rounded-none border-b bg-transparent">
          <TabsTrigger value="campaign" className={TAB_TRIGGER_CLASS_NAMES}>
            Campaign
          </TabsTrigger>
          <TabsTrigger value="rewards" className={TAB_TRIGGER_CLASS_NAMES}>
            Rewards
          </TabsTrigger>
          <TabsTrigger value="updates" className={TAB_TRIGGER_CLASS_NAMES}>
            Updates ({campaign._count?.updates ?? 0})
          </TabsTrigger>
          <TabsTrigger value="comments" className={TAB_TRIGGER_CLASS_NAMES}>
            Comments ({campaign._count?.comments ?? 0})
          </TabsTrigger>
          <TabsTrigger value="transactions" className={TAB_TRIGGER_CLASS_NAMES}>
            Transactions ({contributorCount - contributorPendingCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="mt-6">
          <CampaignDetailTabAbout campaign={campaign} />
        </TabsContent>

        <TabsContent value="rewards">
          <CampaignDetailTabRewards campaign={campaign} />
        </TabsContent>

        <TabsContent value="updates">
          <CampaignDetailTabUpdates campaign={campaign} />
        </TabsContent>

        <TabsContent value="comments">
          <CampaignDetailTabComments campaign={campaign} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <CampaignDetailTabTransactions campaign={campaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
