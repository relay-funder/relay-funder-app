'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useAuth } from '@/contexts';
import { Heart } from 'lucide-react';
import { DashboardOverview } from '@/components/dashboard/overview';
import { CampaignCard } from '@/components/campaign/campaign-card';
import { CampaignLoading } from '@/components/campaign/loading';
import { CampaignError } from '@/components/campaign/error';
import { CampaignEmpty } from '@/components/campaign/empty';
import { useInfiniteUserCampaigns } from '@/lib/hooks/useCampaigns';
import { useUserFavourites } from '@/lib/hooks/useFavourites';
import { DashboardNotAuthenticated } from '@/components/dashboard/not-authenticated';
import { UnifiedLayout } from '@/components/page/unified-layout';
import { CampaignCreate } from '@/components/campaign/create';
import { Button } from '@/components/ui';
import { useCallback, useState } from 'react';
import { CampaignUserList } from '@/components/campaign/list-user';

export default function DashboardPage() {
  const [showCampaignCreate, setShowCampaignCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { authenticated } = useAuth();
  const { isLoading: loading, error } = useInfiniteUserCampaigns();

  const {
    data: favourites,
    isLoading: loadingFavourites,
    error: favouriteError,
  } = useUserFavourites();

  const onCreate = useCallback(async () => {
    setShowCampaignCreate(true);
  }, []);

  const onCreated = useCallback(async () => {
    setShowCampaignCreate(false);
  }, []);

  const onSearchChanged = useCallback(
    (search: string) => {
      setSearchTerm(search);
    },
    [setSearchTerm],
  );

  if (!authenticated) {
    return (
      <UnifiedLayout
        title="Dashboard"
        searchPlaceholder="Search Your Campaigns"
        onSearchChanged={onSearchChanged}
        showWalletConnect={false}
      >
        <DashboardOverview />
        <DashboardNotAuthenticated />
      </UnifiedLayout>
    );
  }

  if (loading || loadingFavourites) {
    return (
      <UnifiedLayout
        title="Dashboard"
        searchPlaceholder="Search Your Campaigns"
        onSearchChanged={onSearchChanged}
        onCreate={onCreate}
        createTitle="Create Campaign"
        showWalletConnect={false}
      >
        <DashboardOverview />
        <Tabs defaultValue="my-campaigns" className="mt-8">
          <TabsList className="mb-6">
            <TabsTrigger value="my-campaigns" className="px-4 py-2">
              My Campaigns
            </TabsTrigger>
            <TabsTrigger value="favorites" className="px-4 py-2">
              <Heart className="mr-2 h-4 w-4" />
              My Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-campaigns">
            <CampaignLoading />
          </TabsContent>

          <TabsContent value="favorites">
            <CampaignLoading />
          </TabsContent>
        </Tabs>
      </UnifiedLayout>
    );
  }

  if (showCampaignCreate) {
    return (
      <UnifiedLayout
        title="Create Campaign"
        searchPlaceholder="Search Your Campaigns"
        onSearchChanged={onSearchChanged}
        showWalletConnect={false}
        buttons={
          <Button
            variant="outline"
            onClick={() => setShowCampaignCreate(false)}
          >
            ← Back to Dashboard
          </Button>
        }
      >
        <CampaignCreate onCreated={onCreated} />
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      title="Dashboard"
      searchPlaceholder="Search Your Campaigns"
      onSearchChanged={onSearchChanged}
      onCreate={onCreate}
      createTitle="Create Campaign"
      showWalletConnect={false}
    >
      {!error && <DashboardOverview />}

      <Tabs defaultValue="my-campaigns" className="mt-8">
        <TabsList className="mb-6">
          <TabsTrigger value="my-campaigns" className="px-4 py-2">
            My Campaigns
          </TabsTrigger>
          <TabsTrigger value="favorites" className="px-4 py-2">
            <Heart className="mr-2 h-4 w-4" />
            My Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-campaigns">
          {error ? (
            <CampaignError error={error.message} />
          ) : (
            <CampaignUserList
              searchTerm={searchTerm}
              statusFilter="all"
              pageSize={3}
              withRounds={true}
              item={(props) => <CampaignCard {...props} type="dashboard" />}
              onCreate={onCreate}
            />
          )}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favourites?.map((favourite) => (
                <CampaignCard
                  type="dashboard"
                  key={`favorite-${favourite.campaign.id}`}
                  campaign={favourite.campaign}
                  isFavorite={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </UnifiedLayout>
  );
}
