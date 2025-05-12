import { useCallback, useState, type ChangeEvent } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
} from '@/components/ui';
import { Edit } from 'lucide-react';
import { Collection } from '@/types';
import { useCollection } from '@/contexts';
import { toast } from '@/hooks/use-toast';

export function CollectionEditDialog({
  collection,
}: {
  collection: Collection;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description ?? '');
  const { updateCollection, isLoading } = useCollection();
  const canEdit = !isLoading && name.trim().length !== 0;
  const onCancel = useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);
    },
    [setOpen],
  );
  const onNameChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [setName],
  );
  const onDescriptionChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setDescription(event.target.value),
    [setDescription],
  );
  const onEdit = useCallback(async () => {
    if (!collection) {
      return;
    }

    try {
      await updateCollection({
        collectionId: collection.id,
        name,
        description,
      });
      setOpen(false);
      toast({
        title: 'Collection updated',
        description: 'Your changes have been saved',
      });
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update collection',
        variant: 'destructive',
      });
    }
  }, [collection, updateCollection, name, description]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <label
              htmlFor="collectionName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Collection Name
            </label>
            <Input
              id="collectionName"
              value={name}
              onChange={onNameChanged}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="collectionDescription"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description (Optional)
            </label>
            <Input
              id="collectionDescription"
              value={description}
              onChange={onDescriptionChanged}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={onEdit}
            disabled={!canEdit}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
