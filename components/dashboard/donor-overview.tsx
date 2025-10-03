import { Card, CardContent } from '@/components/ui';
import { useDonationStats } from '@/lib/hooks/useDonations';
import { Heart, Coins, Target, TrendingUp } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';

/**
 * DonorDashboardOverview Component
 *
 * Shows donor/backer statistics including total contributions,
 * number of campaigns backed, and donation activity.
 */
export function DonorDashboardOverview() {
  const { data: stats, isPending } = useDonationStats();

  return (
    <div className="mb-8">
      <ResponsiveGrid variant="compact" gap="md">
        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-bio/10 dark:bg-bio/20">
              <Coins className="h-6 w-6 text-bio" />
            </div>
            <div>
              <p className="whitespace-nowrap text-xs font-medium text-muted-foreground md:text-sm">
                Total Contributed
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.totalDonated.toFixed(2) ?? 0} USDC
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-2 md:p-6">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-quantum/10 dark:bg-quantum/20">
              <Target className="h-6 w-6 text-quantum" />
            </div>
            <div>
              <p className="whitespace-nowrap text-xs font-medium text-muted-foreground md:text-sm">
                Campaigns Backed
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
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 dark:bg-accent/30">
              <Heart className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="whitespace-nowrap text-xs font-medium text-muted-foreground md:text-sm">
                Total Donations
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.totalDonations ?? 0}
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
              <p className="whitespace-nowrap text-xs font-medium text-muted-foreground md:text-sm">
                Avg. Contribution
              </p>
              {isPending ? (
                <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
              ) : (
                <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
                  {stats?.totalDonations && stats?.totalDonations > 0
                    ? (stats.totalDonated / stats.totalDonations).toFixed(2)
                    : '0.00'}{' '}
                  USDC
                </h3>
              )}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
}
