import { Card, CardHeader, CardContent } from '@/components/ui';
import { type Collection } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export function CollectionCard({ collection }: { collection: Collection }) {
  console.log({ collection });
  return (
    <Link href={`/collections/${collection.id}`} key={collection.id}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="flex h-[140px] items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-0">
          {collection.items?.length > 0 ? (
            <div className="grid h-full w-full grid-cols-2 gap-1">
              {collection.items.slice(0, 4).map((item) => (
                <div
                  key={item.itemId}
                  className="relative h-[70px] w-full overflow-hidden"
                >
                  <Image
                    src={item.details?.image ?? '/images/placeholder.svg'}
                    alt={item.details?.title ?? 'Collection Item'}
                    sizes='sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"'
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-white">
              <Image
                src="/sparkles.png"
                alt="Empty collection"
                width={48}
                height={48}
                className="mx-auto mb-2"
              />
              <p>No items yet</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="mb-1 text-xl font-bold">{collection.name}</h3>
          <p className="mb-2 text-sm text-gray-600">
            {collection.items?.length}{' '}
            {collection.items?.length === 1 ? 'item' : 'items'}
          </p>
          <p className="line-clamp-2 text-sm text-gray-500">
            {collection.description || 'No description'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
