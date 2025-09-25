import { Card, CardContent, CardFooter, Skeleton } from '@/components/ui';

export function PaymentLoading({ expectItemCount = 3 }: { expectItemCount?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(expectItemCount)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-1 w-1 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-8" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
