'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { SideBar } from '@/components/SideBar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  AlertCircle,
  Coins,
  Users,
  Calendar,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { Campaign } from '@/types/campaign';
import CampaignCard from '@/components/campaign-card';

interface FavoriteCampaign {
  id: string;
  campaign: Campaign;
}

export default function DashboardPage() {
  const { address, authenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const { isOpen } = useSidebar();

  useEffect(() => {
    if (!authenticated || !address) {
      // Don't fetch or set error until both are ready
      return;
    }
    const fetchUserCampaigns = async () => {
      try {
        console.log('Fetching campaigns for address:', address);
        const response = await fetch(`/api/campaigns/user?address=${address}`);
        const data = await response.json();

        console.log('API Response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch campaigns');
        }

        setCampaigns(data.campaigns);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    const fetchFavoriteCampaigns = async () => {
      try {
        const response = await fetch(
          `/api/favorites/user?userAddress=${address}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch favorite campaigns');
        }

        // Transform the data to match Campaign type
        const favorites = data.favorites.map((fav: FavoriteCampaign) => ({
          ...fav.campaign,
          favoriteId: fav.id,
        }));

        setFavoriteCampaigns(favorites);
      } catch (err) {
        console.error('Error fetching favorite campaigns:', err);
        setFavoriteError(
          err instanceof Error ? err.message : 'An error occurred',
        );
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchUserCampaigns();
    fetchFavoriteCampaigns();
  }, [authenticated, address]);

  if (!authenticated && !address) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SideBar />
        <div
          className={cn(
            'flex-1 p-8 transition-all duration-300 ease-in-out',
            isOpen ? 'ml-[240px]' : 'ml-[70px]',
          )}
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-3xl font-bold">Dashboard</div>

            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-gray-600">
                      Total Campaigns
                    </p>
                    <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-green-100">
                    <Coins className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-gray-600">
                      Total Raised
                    </p>
                    <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-purple-100">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-gray-600">
                      Active Campaigns
                    </p>
                    <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-yellow-100">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-gray-600">
                      Average Progress
                    </p>
                    <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Login to your account
                </h3>
                <p className="mb-6 max-w-md text-gray-500">
                  Please connect your wallet to view your campaign dashboard and
                  manage your fundraising activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (loading || loadingFavorites) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const calculateStats = (campaigns: Campaign[]) => {
    return {
      totalCampaigns: campaigns.length,
      totalRaised: campaigns.reduce((sum, campaign) => {
        const raised = campaign.totalRaised ? Number(campaign.totalRaised) : 0;
        return sum + raised;
      }, 0),
      activeCampaigns: campaigns.filter((campaign) => {
        const now = Math.floor(Date.now() / 1000);
        const launchTime = campaign.launchTime
          ? parseInt(campaign.launchTime)
          : now;
        const deadline = campaign.deadline ? parseInt(campaign.deadline) : now;
        return (
          now >= launchTime && now <= deadline && campaign.status === 'active'
        );
      }).length,
      averageProgress:
        campaigns.length > 0
          ? campaigns.reduce((sum, campaign) => {
              if (!campaign.totalRaised || !campaign.goalAmount) return sum;
              const progress =
                (Number(campaign.totalRaised) / Number(campaign.goalAmount)) *
                100;
              return sum + (isNaN(progress) ? 0 : progress);
            }, 0) / campaigns.length
          : 0,
    };
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <div className="mx-auto max-w-7xl p-5">
        <div className="mb-8 pt-5 text-3xl font-bold">Dashboard</div>

        {!loading && !error && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Campaigns
                  </p>
                  <h3 className="text-2xl font-bold">
                    {calculateStats(campaigns).totalCampaigns}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Raised
                  </p>
                  <h3 className="text-2xl font-bold">
                    {calculateStats(campaigns).totalRaised.toFixed(2)} USDC
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Campaigns
                  </p>
                  <h3 className="text-2xl font-bold">
                    {calculateStats(campaigns).activeCampaigns}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Progress
                  </p>
                  <h3 className="text-2xl font-bold">
                    {calculateStats(campaigns).averageProgress.toFixed(1)}%
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader className="h-[200px] bg-gray-200 p-0" />
                    <CardContent className="p-6">
                      <div className="mb-4 h-6 rounded bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-gray-200" />
                        <div className="h-4 rounded bg-gray-200" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">
                  You haven&apos;t created any campaigns yet.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = '/')}
                >
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns?.map((campaign: Campaign) => (
                  <CampaignCard key={campaign.address} campaign={campaign} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {loadingFavorites ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader className="h-[200px] bg-gray-200 p-0" />
                    <CardContent className="p-6">
                      <div className="mb-4 h-6 rounded bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-gray-200" />
                        <div className="h-4 rounded bg-gray-200" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : favoriteError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{favoriteError}</AlertDescription>
              </Alert>
            ) : favoriteCampaigns.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">
                  You haven&apos;t saved any campaigns as favorites yet.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = '/')}
                >
                  Explore Campaigns
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoriteCampaigns?.map((campaign: Campaign) => (
                  <CampaignCard
                    key={`favorite-${campaign.id}`}
                    campaign={campaign}
                    isFavorite={true}
                    onFavoriteToggle={(isFavorite) => {
                      if (!isFavorite) {
                        setFavoriteCampaigns((prev) =>
                          prev.filter((c) => c.id !== campaign.id),
                        );
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
