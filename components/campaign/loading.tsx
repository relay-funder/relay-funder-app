import { Card, CardContent, CardHeader, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

export function CampaignLoading({
  minimal = false,
  expectItemCount = 3,
  variant = 'list',
}: {
  minimal?: boolean;
  expectItemCount?: number;
  variant?: 'list' | 'detail';
}) {
  if (variant === 'detail') {
    return <CampaignDetailLoading />;
  }

  return (
    <div
      className={cn(
        'grid gap-6',
        expectItemCount > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
      )}
    >
      {/* home: grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 */}
      {[...Array(expectItemCount)].map((_, index) =>
        minimal ? (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card key={index} className="animate-pulse">
            <CardHeader className="h-[200px] bg-muted p-0" />
            <CardContent className="p-6">
              <div className="mb-4 h-6 rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

function CampaignDetailLoading() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column: Main Content */}
      <div className="lg:col-span-2">
        {/* Top Section: Image and Title Box */}
        <div className="mb-8 space-y-6">
          {/* Main Image Skeleton */}
          <div className="relative">
            <div className="aspect-video overflow-hidden rounded-lg shadow-sm">
              <Skeleton className="h-full w-full" />
            </div>
          </div>

          {/* Title and Location Box Skeleton */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* About Section Skeleton */}
        <div className="mb-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section Skeleton */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-6">
            {/* Tab buttons */}
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
            {/* Tab content */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Campaign Cards Skeleton */}
      <div className="lg:col-span-1">
        <div className="space-y-6">
          {/* Funding Box Skeleton */}
          <Card className="animate-pulse">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Details Box Skeleton */}
          <Card className="animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>

          {/* Matching Funds Skeleton */}
          <Card className="animate-pulse">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
