import { CollectionCard } from './card';
import { type Collection } from '@/types';
export function CollectionList({ collections }: { collections: Collection[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
