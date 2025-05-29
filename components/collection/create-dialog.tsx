'use client';
import { useCallback, useState, type ChangeEvent } from 'react';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
  Button,
  Input,
} from '@/components/ui';
import { Plus } from 'lucide-react';
import { useCollection } from '@/contexts';
export function CollectionCreateDialog({
  buttonTitle,
  onClosed,
}: {
  buttonTitle?: string;
  onClosed?: () => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const onCollectionNameChanged = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setNewCollectionName(event.target.value),
    [setNewCollectionName],
  );
  const { createCollection, isLoading } = useCollection();
  const onClose = useCallback(() => {
    setNewCollectionName('');
    if (typeof onClosed === 'function') {
      onClosed();
    }
  }, [onClosed]);
  const onCancelCreateCollection = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose, setOpen]);
  const onCreate = useCallback(async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: 'Collection name required',
        description: 'Please enter a name for your collection',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCollection({ name: newCollectionName });
      setOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to create collection',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [newCollectionName, createCollection, onClose, setOpen]);
  const canCreate = !isLoading && newCollectionName.trim().length;
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          {buttonTitle ? (
            buttonTitle
          ) : (
            <>
              <span>New</span>{' '}
              <span className="hidden sm:inline">Collection</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Collection</span>
            <Image src="/sparkles.png" alt="sparkles" width={24} height={24} />
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label
            htmlFor="collectionName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Collection Name
          </label>
          <Input
            id="collectionName"
            value={newCollectionName}
            onChange={onCollectionNameChanged}
            placeholder="Enter collection name"
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancelCreateCollection}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={onCreate}
              disabled={!canCreate}
            >
              {isLoading ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
