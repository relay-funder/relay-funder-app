import { Card, CardContent } from '@/components/ui';
import { useCampaignStats } from '@/lib/hooks/useCampaigns';
import { Users, Coins, Calendar, TrendingUp } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';
import { USD_TOKEN } from '@/lib/constant';

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
      <ResponsiveGrid variant="stats" gap="md">
        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-quantum/10 dark:bg-quantum/20">
              <Users className="h-6 w-6 text-quantum" />
            </div>
            <div>
              <p className="whitespace-nowrap font-display text-xs font-medium text-muted-foreground md:text-sm">
                Total Campaigns
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
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
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-bio/10 dark:bg-bio/20">
              <Coins className="h-6 w-6 text-bio" />
            </div>
            <div>
              <p className="whitespace-nowrap font-display text-xs font-medium text-muted-foreground md:text-sm">
                Total Raised
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.totalRaised.toFixed(2) ?? 0} {USD_TOKEN}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 dark:bg-accent/30">
              <Calendar className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="whitespace-nowrap font-display text-xs font-medium text-muted-foreground md:text-sm">
                Active Campaigns
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
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
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-solar/10 dark:bg-solar/20">
              <TrendingUp className="h-6 w-6 text-solar" />
            </div>
            <div>
              <p className="whitespace-nowrap font-display text-xs font-medium text-muted-foreground md:text-sm">
                Average Progress
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
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
