import { useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import { CollectionItem } from '@/types';

export function CollectionItemCard({
  item,
  isOwner,
  onRemove,
}: {
  item: CollectionItem;
  isOwner: boolean;
  onRemove: (item: CollectionItem) => Promise<void>;
}) {
  const onRemoveItem = useCallback(async () => {
    await onRemove(item);
  }, [item, onRemove]);
  return (
    <Card key={item.itemId} className="overflow-hidden">
      <CardHeader className="p-0">
        <Image
          src={item.details?.image || '/images/placeholder.svg'}
          alt={item.details?.title ?? 'Collection Item'}
          width={600}
          height={400}
          className="h-[200px] w-full object-cover"
        />
      </CardHeader>
      <CardContent className="p-6">
        <Link href={`/campaigns/${item.details?.slug}`}>
          <h3 className="mb-2 text-xl font-bold transition-colors hover:text-purple-600">
            {item.details?.title ?? 'Collection Item'}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {item.details?.description ?? ''}
        </p>
        <div className="flex items-center justify-between">
          <Link href={`/campaigns/${item.details?.slug}`}>
            <Button variant="outline" size="sm">
              View Campaign
            </Button>
          </Link>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={onRemoveItem}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
