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
import { useAuth } from '@/contexts';
import { useFeatureFlag } from '@/lib/flags';

export function CampaignDetailTabs({ campaign }: { campaign: DbCampaign }) {
  const { contributorCount, contributorPendingCount } =
    useCampaignStatsFromInstance({ campaign });
  const { isAdmin } = useAuth();
  const isRoundsVisibilityEnabled = useFeatureFlag('ROUNDS_VISIBILITY');
  const [activeTab, setActiveTab] = useState('updates');

  // Handle update anchor links - only switch tab, don't prevent user navigation
  useUpdateAnchor({
    onUpdateTarget: () => {
      // Switch to updates tab when an update is targeted
      setActiveTab('updates');
    },
  });

  const showRoundsTab = isRoundsVisibilityEnabled || isAdmin;
  const gridCols = showRoundsTab
    ? 'grid-cols-2 sm:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-3';

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid h-auto w-full gap-1 rounded-md bg-muted p-1 pb-[3px] ${gridCols} sm:gap-0`}
        >
          <TabsTrigger
            value="updates"
            className="rounded-sm px-1 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
          >
            <span>Updates</span>
            <span className="ml-1">({campaign._count?.updates ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-sm px-1 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
          >
            <span className="hidden sm:inline">Transactions</span>
            <span className="sm:hidden">Trans.</span>
            <span className="ml-1">
              ({contributorCount - contributorPendingCount})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-sm px-1 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
          >
            <span className="hidden sm:inline">Comments</span>
            <span className="sm:hidden">Comm.</span>
            <span className="ml-1">({campaign._count?.comments ?? 0})</span>
          </TabsTrigger>
          {showRoundsTab && (
            <TabsTrigger
              value="rounds"
              className="rounded-sm px-1 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
            >
              <span>Rounds</span>
              <span className="ml-1">({campaign.rounds?.length ?? 0})</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-4 min-h-[300px]">
          <TabsContent value="updates" className="mt-0">
            <CampaignDetailTabUpdates campaign={campaign} />
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <CampaignDetailTabTransactions campaign={campaign} />
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <CampaignDetailTabComments campaign={campaign} />
          </TabsContent>

          {showRoundsTab && (
            <TabsContent value="rounds" className="mt-0">
              <CampaignDetailTabRounds campaign={campaign} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
