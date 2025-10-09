import { Card, CardContent } from '@/components/ui';
import { useDonationStats } from '@/lib/hooks/useDonations';
import { useUserScore } from '@/lib/hooks/useUserScore';
import { Heart, Coins, Target, TrendingUp, Flower2 } from 'lucide-react';
import { ResponsiveGrid } from '@/components/layout';

/**
 * DonorDashboardOverview Component
 *
 * Shows donor/backer statistics including total contributions,
 * number of campaigns backed, and donation activity.
 */
export function DonorDashboardOverview() {
  const { data: stats, isPending } = useDonationStats();
  const { data: score, isLoading: isScoreLoading } = useUserScore();

  return (
    <div className="mb-8">
      <ResponsiveGrid variant="overview" gap="md">
        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 md:p-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-bio/10 dark:bg-bio/20 sm:h-12 sm:w-12">
              <Coins className="h-5 w-5 text-bio sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total Contributed
              </p>
              {isPending ? (
                <div className="mt-1 h-6 animate-pulse rounded bg-muted sm:h-8" />
              ) : (
                <h3 className="truncate text-lg font-bold sm:text-xl md:text-2xl">
                  ${Math.floor(stats?.totalDonated ?? 0)} USDC
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 md:p-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-quantum/10 dark:bg-quantum/20 sm:h-12 sm:w-12">
              <Target className="h-5 w-5 text-quantum sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Campaigns Backed
              </p>
              {isPending ? (
                <div className="mt-1 h-6 animate-pulse rounded bg-muted sm:h-8" />
              ) : (
                <h3 className="text-lg font-bold sm:text-xl md:text-2xl">
                  {stats?.totalCampaigns ?? 0}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 md:p-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 dark:bg-accent/30 sm:h-12 sm:w-12">
              <Heart className="h-5 w-5 text-accent-foreground sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total Donations
              </p>
              {isPending ? (
                <div className="mt-1 h-6 animate-pulse rounded bg-muted sm:h-8" />
              ) : (
                <h3 className="text-lg font-bold sm:text-xl md:text-2xl">
                  {stats?.totalDonations ?? 0}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 md:p-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-solar/10 dark:bg-solar/20 sm:h-12 sm:w-12">
              <TrendingUp className="h-5 w-5 text-solar sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Avg. Contribution
              </p>
              {isPending ? (
                <div className="mt-1 h-6 animate-pulse rounded bg-muted sm:h-8" />
              ) : (
                <h3 className="truncate text-lg font-bold sm:text-xl md:text-2xl">
                  $
                  {stats?.totalDonations && stats?.totalDonations > 0
                    ? Math.floor(stats.totalDonated / stats.totalDonations)
                    : 0}{' '}
                  USDC
                </h3>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 md:p-6">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 sm:h-12 sm:w-12">
              <Flower2 className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Karma
              </p>
              {isScoreLoading ? (
                <div className="mt-1 h-6 animate-pulse rounded bg-muted sm:h-8" />
              ) : (
                <h3 className="text-lg font-bold sm:text-xl md:text-2xl">
                  {score?.totalScore ?? 0}
                </h3>
              )}
            </div>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
}
