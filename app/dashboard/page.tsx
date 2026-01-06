'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { useAuth } from '@/contexts';
import { Heart, History, Bell, Info, Flower2 } from 'lucide-react';
import { useMetaTitle } from '@/hooks/use-meta-title';
import { DonorDashboardOverview } from '@/components/dashboard/donor-overview';
import { FavoriteCard } from '@/components/dashboard/favorite-card';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { CampaignEmpty } from '@/components/campaign/empty';
import { useUserFavourites } from '@/lib/hooks/useFavourites';
import { DashboardNotAuthenticated } from '@/components/dashboard/not-authenticated';
import { PageLayout } from '@/components/page/layout';
import { DonationHistory } from '@/components/dashboard/donation-history';
import { CampaignUpdates } from '@/components/dashboard/campaign-updates';
import { ScoreList } from '@/components/dashboard/score-list';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

const dashTabsClasses = {
  list: cn('mb-6 h-full w-full', 'grid grid-cols-2 gap-2', 'sm:grid-cols-4'),
  trigger: cn(
    'whitespace-nowrap p-2 text-xs',
    'data-[state=inactive]:border data-[state=inactive]:border-border',
    'sm:px-4 sm:text-sm',
  ),
  icon: cn('mr-1 size-4 shrink-0', 'sm:mr-2'),
  label: cn('hidden lg:inline'),
  labelShort: cn('lg:hidden'),
  tooltipContent: cn('max-w-48 text-xs'),
  tooltipTrigger: cn('ml-1 size-3 shrink-0 cursor-help text-muted-foreground'),
};

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { authenticated } = useAuth();
  const [removedFavorites, setRemovedFavorites] = useState<Set<number>>(
    new Set(),
  );

  // Set page title for browser history
  useMetaTitle('Donor Dashboard | Relay Funder');

  const {
    data: favourites,
    isLoading: loadingFavourites,
    error: favouriteError,
  } = useUserFavourites();

  const onSearchChanged = useCallback(
    (search: string) => {
      setSearchTerm(search);
    },
    [setSearchTerm],
  );

  const handleFavoriteRemoved = useCallback((campaignId: number) => {
    setRemovedFavorites((prev) => new Set(prev).add(campaignId));
  }, []);

  if (!authenticated) {
    return (
      <PageLayout
        title="Dashboard"
        searchPlaceholder="Search Favorites"
        onSearchChanged={onSearchChanged}
      >
        <DonorDashboardOverview />
        <DashboardNotAuthenticated />
      </PageLayout>
    );
  }

  if (loadingFavourites) {
    return (
      <PageLayout
        title="Dashboard"
        searchPlaceholder="Search Favorites"
        onSearchChanged={onSearchChanged}
      >
        <DonorDashboardOverview />
        <TooltipProvider>
          <Tabs defaultValue="score" className="mt-8">
            <TabsList className={dashTabsClasses.list}>
              <TabsTrigger value="score" className={dashTabsClasses.trigger}>
                <Flower2 className={dashTabsClasses.icon} />
                Karma
              </TabsTrigger>
              <TabsTrigger value="history" className={dashTabsClasses.trigger}>
                <History className={dashTabsClasses.icon} />
                <span className={dashTabsClasses.label}>Donation History</span>
                <span className={dashTabsClasses.labelShort}>History</span>
              </TabsTrigger>
              <TabsTrigger
                value="favorites"
                className={dashTabsClasses.trigger}
              >
                <Heart className={dashTabsClasses.icon} />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="updates" className={dashTabsClasses.trigger}>
                <Bell className={dashTabsClasses.icon} />
                <span className={dashTabsClasses.label}>Updates</span>
                <span className={dashTabsClasses.labelShort}>
                  Campaign Updates
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className={dashTabsClasses.tooltipTrigger} />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className={dashTabsClasses.tooltipContent}
                  >
                    <p>Updates are from favorites and from donation history.</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="score">
              <CampaignLoading />
            </TabsContent>

            <TabsContent value="history">
              <CampaignLoading />
            </TabsContent>

            <TabsContent value="favorites">
              <CampaignLoading />
            </TabsContent>

            <TabsContent value="updates">
              <CampaignLoading />
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Dashboard"
      searchPlaceholder="Search Favorites"
      onSearchChanged={onSearchChanged}
    >
      <DonorDashboardOverview />

      <TooltipProvider>
        <Tabs defaultValue="score" className="mt-8">
          <TabsList className={dashTabsClasses.list}>
            <TabsTrigger value="score" className={dashTabsClasses.trigger}>
              <Flower2 className={dashTabsClasses.icon} />
              Karma
            </TabsTrigger>
            <TabsTrigger value="history" className={dashTabsClasses.trigger}>
              <History className={dashTabsClasses.icon} />
              <span className={dashTabsClasses.label}>Donation History</span>
              <span className={dashTabsClasses.labelShort}>History</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className={dashTabsClasses.trigger}>
              <Heart className={dashTabsClasses.icon} />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="updates" className={dashTabsClasses.trigger}>
              <Bell className={dashTabsClasses.icon} />
              <span className={dashTabsClasses.label}>Campaign Updates</span>
              <span className={dashTabsClasses.labelShort}>Updates</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className={dashTabsClasses.tooltipTrigger} />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={dashTabsClasses.tooltipContent}
                >
                  <p>Updates are from favorites and from donation history.</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="score">
            <ScoreList />
          </TabsContent>

          <TabsContent value="history">
            <DonationHistory />
          </TabsContent>

          <TabsContent value="favorites">
            {favouriteError ? (
              <CampaignError error={favouriteError.message} />
            ) : favourites?.length === 0 ? (
              <CampaignEmpty
                message="You haven't saved any campaigns as favorites yet."
                buttonText="Explore Campaigns"
                buttonHref="/"
              />
            ) : (
              <div className="space-y-3">
                {favourites
                  ?.filter((favourite) => {
                    // Filter out removed favorites
                    if (removedFavorites.has(favourite.campaign.id)) {
                      return false;
                    }

                    // Apply search filter
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      favourite.campaign.title
                        ?.toLowerCase()
                        .includes(searchLower) ||
                      favourite.campaign.description
                        ?.toLowerCase()
                        .includes(searchLower) ||
                      favourite.campaign.location
                        ?.toLowerCase()
                        .includes(searchLower)
                    );
                  })
                  .map((favourite) => (
                    <FavoriteCard
                      key={`favorite-${favourite.campaign.id}`}
                      favourite={favourite}
                      onRemoved={handleFavoriteRemoved}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="updates">
            <CampaignUpdates />
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </PageLayout>
  );
}
