'use client';
import React, {
  useState,
  useCallback,
  useMemo,
  createContext,
  ReactNode,
} from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogOptions {
  title: string;
  description: string | ReactNode;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
}

interface ConfirmContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] =
    useState<(value: boolean) => void>();
  const [isPending, setIsPending] = useState(false);

  const confirm = useCallback(
    (opts: ConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setOptions({
          ...opts,
          // Default values if not provided
          confirmText: opts.confirmText || 'Continue',
          cancelText: opts.cancelText || 'Cancel',
          confirmVariant: opts.confirmVariant || 'destructive',
        });
        setIsOpen(true);
        setResolvePromise(() => resolve);
      });
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (options && resolvePromise) {
      setIsPending(true);
      try {
        await options.onConfirm();
        resolvePromise(true);
      } catch (error) {
        console.error('Confirmation action failed:', error);
        resolvePromise(false); // Indicate failure
      } finally {
        setIsPending(false);
        setIsOpen(false);
        setTimeout(() => setOptions(null), 200);
      }
    }
  }, [options, resolvePromise]);

  const handleCancel = useCallback(() => {
    if (options && resolvePromise) {
      options.onCancel?.();
      resolvePromise(false);
      setIsOpen(false);
      setTimeout(() => setOptions(null), 200);
    }
  }, [options, resolvePromise]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && options) {
            handleCancel();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {options?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isPending}>
              {options?.cancelText}
            </AlertDialogCancel>
            <Button
              variant={options?.confirmVariant}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {options?.confirmText}ing...
                </>
              ) : (
                options?.confirmText
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
};

export default ConfirmContext; // Export the context itself for use in the hook
