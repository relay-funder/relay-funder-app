import { Card, CardContent, CardHeader, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
export function PaymentLoading({
  minimal = false,
  expectItemCount = 3,
}: {
  minimal?: boolean;
  expectItemCount?: number;
}) {
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
            <CardHeader className="h-[200px] bg-gray-200 p-0" />
            <CardContent className="p-6">
              <div className="mb-4 h-6 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-200" />
                <div className="h-4 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
