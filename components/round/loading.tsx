import { Card, CardContent, CardHeader, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page/header';
import { PageHome } from '@/components/page/home';
import { DetailContainer } from '@/components/layout';

export function RoundLoading({
  minimal = false,
  expectItemCount = 3,
}: {
  minimal?: boolean;
  expectItemCount?: number;
}) {
  // For rounds detail page (single round), show the full page skeleton
  if (expectItemCount === 1 || minimal === false) {
    return <RoundDetailSkeleton />;
  }

  // For rounds list page, show the grid skeleton
  return (
    <div
      className={cn(
        'grid gap-6',
        expectItemCount > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
      )}
    >
      {[...Array(expectItemCount)].map((_, index) => (
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
  );
}

// Skeleton specifically for the rounds detail page
function RoundDetailSkeleton() {
  const header = <PageHeader />;

  return (
    <PageHome header={header}>
      <DetailContainer variant="standard" padding="md">
        <div className="space-y-6">
          {/* Round Header Section - Large Logo + Title */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Large Round Avatar/Logo */}
              <div className="shrink-0">
                <Skeleton className="h-24 w-24 rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                {/* Round Title */}
                <Skeleton className="mb-3 h-9 w-3/4" />
                {/* Round URL */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Round Info Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Round Description */}
          <Card className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* Participating Campaigns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="mb-2 h-7 w-64" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-10 w-32 rounded" />
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="h-[200px] bg-gray-200 p-0" />
                  <CardContent className="p-6">
                    <div className="mb-4 h-6 rounded bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-gray-200" />
                      <div className="h-4 rounded bg-gray-200" />
                    </div>
                    {/* Campaign stats */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="h-4 w-20 rounded bg-gray-200" />
                      <div className="h-4 w-16 rounded bg-gray-200" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DetailContainer>
    </PageHome>
  );
}
