import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';
import { Trash2 } from 'lucide-react';
import { Collection } from '@/types';
import { useCollection } from '@/contexts';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export function CollectionDeleteDialog({
  collection,
}: {
  collection: Collection;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { deleteCollection } = useCollection();
  const onCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);
    },
    [setOpen],
  );
  const onDelete = useCallback(async () => {
    if (!collection) {
      return;
    }

    try {
      await deleteCollection({ collectionId: collection.id });
      router.push('/collections');

      toast({
        title: 'Collection deleted',
        description: 'The collection has been permanently deleted',
      });
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive',
      });
    }
  }, [collection, deleteCollection, router]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-200 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Collection</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to delete this collection? This action cannot
            be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
