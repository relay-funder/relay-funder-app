'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { useAuth } from '@/contexts';
import { Heart, History, Bell, Info } from 'lucide-react';
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
import { useCallback, useState } from 'react';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { authenticated } = useAuth();
  const [removedFavorites, setRemovedFavorites] = useState<Set<number>>(
    new Set(),
  );

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
          <Tabs defaultValue="history" className="mt-8">
            <TabsList className="mb-6">
              <TabsTrigger value="history" className="px-4 py-2">
                <History className="mr-2 h-4 w-4" />
                Donation History
              </TabsTrigger>
              <TabsTrigger value="favorites" className="px-4 py-2">
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="updates" className="px-4 py-2">
                <Bell className="mr-2 h-4 w-4" />
                Updates
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-3 w-3 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-48 text-xs">
                    <p>Updates are from favorites and from donation history.</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
            </TabsList>

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
        <Tabs defaultValue="history" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="history" className="px-4 py-2">
              <History className="mr-2 h-4 w-4" />
              Donation History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="px-4 py-2">
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="updates" className="px-4 py-2">
              <Bell className="mr-2 h-4 w-4" />
              Updates
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="ml-1 h-3 w-3 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-48 text-xs">
                  <p>Updates are from favorites and from donation history.</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
          </TabsList>

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
