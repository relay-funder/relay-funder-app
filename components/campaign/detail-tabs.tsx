'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { type DbCampaign } from '@/types/campaign';
import { CampaignDetailTabUpdates } from './detail-tab-updates';
import { CampaignDetailTabComments } from './detail-tab-comments';
import { CampaignDetailTabTransactions } from './detail-tab-transactions';
import { useCampaignStatsFromInstance } from '@/hooks/use-campaign-stats';
import { CampaignDetailTabRounds } from './detail-tab-rounds';
import { useUpdateAnchor } from '@/hooks/use-update-anchor';
import { useState } from 'react';

export function CampaignDetailTabs({ campaign }: { campaign: DbCampaign }) {
  const { contributorCount, contributorPendingCount } =
    useCampaignStatsFromInstance({ campaign });
  const [activeTab, setActiveTab] = useState('transactions');

  // Handle update anchor links - only switch tab, don't prevent user navigation
  useUpdateAnchor({
    onUpdateTarget: () => {
      // Switch to updates tab when an update is targeted
      setActiveTab('updates');
    },
  });

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-12 w-full grid-cols-4 rounded-md bg-gray-100 p-1 pb-[3px]">
          <TabsTrigger
            value="transactions"
            className="rounded-sm px-2 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Transactions ({contributorCount - contributorPendingCount})
          </TabsTrigger>
          <TabsTrigger
            value="updates"
            className="rounded-sm px-2 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Updates ({campaign._count?.updates ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-sm px-2 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Comments ({campaign._count?.comments ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="rounds"
            className="rounded-sm px-2 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
          >
            Rounds ({campaign.rounds?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 min-h-[300px]">
          <TabsContent value="transactions" className="mt-0">
            <CampaignDetailTabTransactions campaign={campaign} />
          </TabsContent>

          <TabsContent value="updates" className="mt-0">
            <CampaignDetailTabUpdates campaign={campaign} />
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <CampaignDetailTabComments campaign={campaign} />
          </TabsContent>

          <TabsContent value="rounds" className="mt-0">
            <CampaignDetailTabRounds campaign={campaign} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
