import { Skeleton } from '@/components/ui';
import { CollectionItemsLoading } from './items-loading';
export function CollectionDetailLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center">
        <Skeleton className="mr-4 h-10 w-20" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="mb-8 h-6 w-full max-w-3xl" />
      <CollectionItemsLoading />
    </div>
  );
}
