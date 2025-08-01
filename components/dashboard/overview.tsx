import type { DbCampaign } from '@/types/campaign';
import { Card, CardContent } from '@/components/ui';
import { Users, Coins, Calendar, TrendingUp } from 'lucide-react';
const calculateStats = (campaigns: DbCampaign[]) => {
  console.warn('Bad implementation, needs the backend to summarize', {
    campaigns,
  });
  return {
    totalCampaigns: 0,
    totalRaised: 0,
    activeCampaigns: 0,
    averageProgress: 0,
  };
};

export function DashboardOverview({ campaigns }: { campaigns?: DbCampaign[] }) {
  const hasCampaigns = Array.isArray(campaigns);
  return (
    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
            {hasCampaigns ? (
              <h3 className="text-2xl font-bold">
                {calculateStats(campaigns).totalCampaigns}
              </h3>
            ) : (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center p-6">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Coins className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Raised</p>
            {hasCampaigns ? (
              <h3 className="text-2xl font-bold">
                {calculateStats(campaigns).totalRaised.toFixed(2)} USDC
              </h3>
            ) : (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            )}
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
            {hasCampaigns ? (
              <h3 className="text-2xl font-bold">
                {calculateStats(campaigns).activeCampaigns}
              </h3>
            ) : (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            )}
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
            {hasCampaigns ? (
              <h3 className="text-2xl font-bold">
                {calculateStats(campaigns).averageProgress.toFixed(1)}%
              </h3>
            ) : (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
