import { Card, CardHeader, CardContent, Skeleton } from '@/components/ui';

export function CollectionItemsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="h-[200px] w-full" />
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-4 h-4 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
