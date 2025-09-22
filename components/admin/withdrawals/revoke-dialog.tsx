'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui';

export type RevokeDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (data: { notes: string }) => void | Promise<void>;
  defaultNotes?: string | null;
  title?: string;
  description?: string;
  confirmText?: string;
  isSubmitting?: boolean;
};

export function RevokeDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultNotes = '',
  title = 'Revoke Approval',
  description = 'Provide a note explaining why this approval is being revoked. This note will be recorded.',
  confirmText = 'Revoke',
  isSubmitting = false,
}: RevokeDialogProps) {
  const [notes, setNotes] = useState<string>(defaultNotes ?? '');
  const [error, setError] = useState<string | null>(null);
  const initialFocusRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      setNotes(defaultNotes ?? '');
      setError(null);
      const t = setTimeout(() => initialFocusRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, defaultNotes]);

  const isBrowser = useMemo(
    () => typeof window !== 'undefined' && typeof document !== 'undefined',
    [],
  );
  if (!isBrowser) return null;
  if (!open) return null;

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget && !isSubmitting) {
      onOpenChange?.(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && !isSubmitting) {
      onOpenChange?.(false);
    }
  }

  function validateNotes(value: string) {
    const v = value.trim();
    if (!v) return 'A revocation note is required';
    if (v.length < 5)
      return 'Please provide a more descriptive note (min 5 characters)';
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const err = validateNotes(notes);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    await onConfirm?.({ notes: notes.trim() });
  }

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-dialog-title"
      aria-describedby="revoke-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onOverlayClick} />
      <div className="relative z-10 w-[95vw] max-w-lg rounded-md border bg-background shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b p-5">
            <h2 id="revoke-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p
                id="revoke-dialog-description"
                className="mt-1 text-sm text-muted-foreground"
              >
                {description}
              </p>
            ) : null}
          </div>

          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <label htmlFor="revoke-notes" className="text-sm font-medium">
                Revocation Note
              </label>
              <textarea
                id="revoke-notes"
                ref={initialFocusRef}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why the approval is being revoked"
                className="h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground">
                This note is required and will be stored with the revocation.
              </p>
            </div>

            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t p-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Revoking...' : confirmText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
