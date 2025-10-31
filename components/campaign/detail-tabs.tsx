'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
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

  // Define available tabs with their labels and counts
  const tabOptions = [
    {
      value: 'updates',
      label: 'Updates',
      count: campaign._count?.updates ?? 0,
    },
    {
      value: 'transactions',
      label: 'Transactions',
      count: contributorCount - contributorPendingCount,
    },
    {
      value: 'comments',
      label: 'Comments',
      count: campaign._count?.comments ?? 0,
    },
    ...(showRoundsTab
      ? [
          {
            value: 'rounds',
            label: 'Rounds',
            count: campaign.rounds?.length ?? 0,
          },
        ]
      : []),
  ];

  const getCurrentTabLabel = () => {
    const currentTab = tabOptions.find((tab) => tab.value === activeTab);
    return currentTab
      ? `${currentTab.label} (${currentTab.count})`
      : 'Select section';
  };

  const gridCols = showRoundsTab
    ? 'grid-cols-1 sm:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-3';

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile: Dropdown Select */}
        <div className="mb-4 block sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section">
                {getCurrentTabLabel()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label} ({tab.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Traditional Tabs */}
        <TabsList
          className={`hidden h-auto w-full gap-2 rounded-md bg-muted p-2 pb-[6px] sm:grid ${gridCols} sm:gap-0 sm:p-1 sm:pb-[3px]`}
        >
          <TabsTrigger
            value="updates"
            className="rounded-sm px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
          >
            <span>Updates</span>
            <span className="ml-1">({campaign._count?.updates ?? 0})</span>
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-sm px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
          >
            <span>Transactions</span>
            <span className="ml-1">
              ({contributorCount - contributorPendingCount})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-sm px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
          >
            <span>Comments</span>
            <span className="ml-1">({campaign._count?.comments ?? 0})</span>
          </TabsTrigger>
          {showRoundsTab && (
            <TabsTrigger
              value="rounds"
              className="rounded-sm px-2 py-2 text-xs font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-2 sm:py-1.5 sm:text-sm"
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
