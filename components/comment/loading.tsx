import { Card, CardContent, CardFooter, Skeleton } from '@/components/ui';

export function CommentLoading({ expectItemCount = 3 }: { expectItemCount?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(expectItemCount)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
