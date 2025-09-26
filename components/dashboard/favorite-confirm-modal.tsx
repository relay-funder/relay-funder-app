'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Heart, AlertTriangle } from 'lucide-react';

interface FavoriteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignTitle: string;
  isLoading?: boolean;
}

export function FavoriteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  campaignTitle,
  isLoading = false,
}: FavoriteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Remove from Favorites
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to remove{' '}
            <span className="font-medium text-gray-900">
              &quot;{campaignTitle}&quot;
            </span>{' '}
            from your favorites? You can add it back anytime by visiting the
            campaign page.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            {isLoading ? 'Removing...' : 'Remove from Favorites'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
