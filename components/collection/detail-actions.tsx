import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { CollectionEditDialog } from './edit-dialog';
import { CollectionDeleteDialog } from './delete-dialog';
import { Share, ArrowLeft } from 'lucide-react';
import { Collection } from '@/types';
import { toast } from '@/hooks/use-toast';
export function CollectionDetailActions({
  collection,
}: {
  collection: Collection;
}) {
  const router = useRouter();
  const onShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: collection?.name || 'Shared Collection',
          text: `Check out this collection: ${collection?.name}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error('Error sharing:', err);
        });
    } else if (navigator?.clipboard) {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Collection link copied to clipboard',
      });
    }
  }, [collection.name]);
  return (
    <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
      <div className="mb-4 flex items-center md:mb-0">
        <Button
          variant="ghost"
          onClick={() => router.push('/collections')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{collection.name}</h1>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>

        {collection.isOwner && (
          <>
            <CollectionEditDialog collection={collection} />
            <CollectionDeleteDialog collection={collection} />
          </>
        )}
      </div>
    </div>
  );
}
