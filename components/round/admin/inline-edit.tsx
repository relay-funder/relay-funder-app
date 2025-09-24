'use client';

import { useState, useCallback } from 'react';
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
} from '@/components/ui';
import { GetRoundResponseInstance } from '@/lib/api/types';
import { useUpdateRoundBasic } from '@/lib/hooks/useRoundEditBasic';

export function RoundAdminInlineEdit({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  // Local state for editable fields
  const [title, setTitle] = useState<string>(round.title ?? '');
  const [description, setDescription] = useState<string>(
    round.description ?? '',
  );
  // descriptionUrl is optional on the type, keep it safe
  const initialDescriptionUrl =
    (round as unknown as { descriptionUrl?: string | null })?.descriptionUrl ??
    '';
  const [descriptionUrl, setDescriptionUrl] = useState<string>(
    initialDescriptionUrl,
  );
  const [logo, setLogo] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateBasic } = useUpdateRoundBasic();

  const onOpenChange = useCallback((open: boolean) => setOpen(open), []);
  const onCancel = useCallback(() => setOpen(false), []);

  const onReset = useCallback(() => {
    setTitle(round.title ?? '');
    setDescription(round.description ?? '');
    setDescriptionUrl(initialDescriptionUrl ?? '');
    setLogo(null);
  }, [round.title, round.description, initialDescriptionUrl]);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateBasic({
        roundId: round.id,
        title,
        description,
        descriptionUrl: descriptionUrl || '',
        // Preserve existing values for fields expected by PATCH endpoint
        matchingPool: round.matchingPool,
        startTime: round.startTime,
        endTime: round.endTime,
        applicationStartTime: round.applicationStartTime,
        applicationEndTime: round.applicationEndTime,
        tags: Array.isArray(round.tags) ? round.tags : [],
        logo,
      });
      // Clear local logo after successful save
      setLogo(null);
      setOpen(false);
    } catch (e) {
      // Keep messaging minimal and non-blocking
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [
    updateBasic,
    round.id,
    round.matchingPool,
    round.startTime,
    round.endTime,
    round.applicationStartTime,
    round.applicationEndTime,
    round.tags,
    title,
    description,
    descriptionUrl,
    logo,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Basic Info</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Basic Info</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="round-title">Title</Label>
              <Input
                id="round-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Round Title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="round-url">URL</Label>
              <Input
                id="round-url"
                value={descriptionUrl}
                onChange={(e) => setDescriptionUrl(e.target.value)}
                placeholder="https://example.com/round"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="round-description">Description</Label>
              <Textarea
                id="round-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your round..."
                rows={5}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="round-logo">Logo</Label>
              <Input
                id="round-logo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setLogo(file);
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onReset} disabled={saving}>
              Reset
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
