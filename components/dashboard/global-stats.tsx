import { Card, CardContent } from '@/components/ui';
import { Coins, Users, Calendar, TrendingUp } from 'lucide-react';
export function DashboardGlobalStats() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 text-3xl font-bold text-foreground">Dashboard</div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-quantum/10 dark:bg-quantum/20">
              <Users className="h-6 w-6 text-quantum" />
            </div>
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground">
                Total Campaigns
              </p>
              <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-bio/10 dark:bg-bio/20">
              <Coins className="h-6 w-6 text-bio" />
            </div>
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground">
                Total Raised
              </p>
              <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-accent/20 dark:bg-accent/30">
              <Calendar className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground">
                Active Campaigns
              </p>
              <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex items-center p-6">
            <div className="mr-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-solar/10 dark:bg-solar/20">
              <TrendingUp className="h-6 w-6 text-solar" />
            </div>
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground">
                Average Progress
              </p>
              <div className="mt-1 h-8 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-dashed border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-quantum/10 dark:bg-quantum/20">
            <Users className="h-8 w-8 text-quantum" />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-foreground">
            Login to your account
          </h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            Please connect your wallet to view your campaign dashboard and
            manage your fundraising activities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
