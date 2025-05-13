import { toast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { type Collection, type CollectionItem } from '@/types';
import { Button } from '@/components/ui';
import { CollectionItemCard } from './item-card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/contexts';
export function CollectionItemList({ collection }: { collection: Collection }) {
  const router = useRouter();
  const { deleteItemFromCollection } = useCollection();
  const onRemoveItem = useCallback(
    async (item: CollectionItem) => {
      try {
        await deleteItemFromCollection({
          itemId: item.itemId,
          collectionId: collection.id,
        });

        toast({
          title: 'Item removed',
          description: 'The item has been removed from this collection',
        });
      } catch (error) {
        console.error('Error removing item from collection:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove item from collection',
          variant: 'destructive',
        });
      }
    },
    [collection.id, deleteItemFromCollection],
  );
  if (!collection.items?.length) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Image
          src="/sparkles.png"
          alt="Empty collection"
          width={64}
          height={64}
          className="mx-auto mb-4"
        />
        <h3 className="mb-2 text-xl font-semibold">This collection is empty</h3>
        <p className="mb-4 text-gray-600">
          {collection.isOwner
            ? 'Add campaigns to this collection while browsing the platform.'
            : "The owner hasn't added any campaigns to this collection yet."}
        </p>
        <Button onClick={() => router.push('/')}>Browse Campaigns</Button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collection.items.map((item) => (
        <CollectionItemCard
          key={item.itemId}
          item={item}
          isOwner={collection.isOwner}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
}
