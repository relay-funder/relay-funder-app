import { Card, CardContent } from '@/components/ui';
import { useCampaignStats } from '@/lib/hooks/useCampaigns';
import { Users, Coins, Calendar, TrendingUp } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';

/**
 * AdminGlobalOverview Component
 *
 * Shows global statistics across all campaigns in the system.
 * Used in the Admin Campaign Management Center for system-wide oversight.
 */
export function AdminGlobalOverview() {
  const { data: stats, isPending } = useCampaignStats('global');
  return (
    <div className="mb-8">
      <ResponsiveGrid variant="compact" gap="md">
        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="whitespace-nowrap text-xs font-medium text-gray-600 md:text-sm">
                Total Campaigns
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.totalCampaigns ?? 0}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="whitespace-nowrap text-xs font-medium text-gray-600 md:text-sm">
                Total Raised
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.totalRaised.toFixed(2) ?? 0} USDC
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="justify-center">
              <p className="whitespace-nowrap text-xs font-medium text-gray-600 md:text-sm">
                Active Campaigns
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.activeCampaigns ?? 0}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="whitespace-nowrap text-xs font-medium text-gray-600 md:text-sm">
                Average Progress
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-gray-200" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {((stats?.averageProgress ?? 0) * 100).toFixed(1)}%
                </h3>
              )}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
}
