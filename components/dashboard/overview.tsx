import { Card, CardContent } from '@/components/ui';
import { useCampaignStats } from '@/lib/hooks/useCampaigns';
import { Users, Coins, Calendar, TrendingUp } from 'lucide-react';

export function DashboardOverview() {
  const { data: stats, isPending } = useCampaignStats();
  return (
    <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
            {isPending ? (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-2xl font-bold">
                {stats?.totalCampaigns ?? 0}
              </h3>
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
            {isPending ? (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-2xl font-bold">
                {stats?.totalRaised.toFixed(2) ?? 0} USDC
              </h3>
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
            {isPending ? (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-2xl font-bold">
                {stats?.activeCampaigns ?? 0}
              </h3>
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
            {isPending ? (
              <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
            ) : (
              <h3 className="text-2xl font-bold">
                {((stats?.averageProgress ?? 0) * 100).toFixed(1)}%
              </h3>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
