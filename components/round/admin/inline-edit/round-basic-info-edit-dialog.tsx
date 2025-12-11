'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import type { GetRoundResponseInstance } from '@/lib/api/types';
import { useConfirm } from '@/hooks/use-confirm';
import { useUpdateRoundBasic } from '@/lib/hooks/useRoundEditBasic';
import {
  applyLocalDateWithTime,
  toLocalDateInputValue,
  type TimeParts,
} from './date-utils';
import { DateChangeConfirmDescription } from './date-change-confirmation';

type DateFields = {
  applicationStartTime: string;
  applicationEndTime: string;
  startTime: string;
  endTime: string;
};

type InitialTimeParts = {
  applicationStartTime: TimeParts;
  applicationEndTime: TimeParts;
  startTime: TimeParts;
  endTime: TimeParts;
};

function getInitialDescriptionUrl(round: GetRoundResponseInstance): string {
  return (
    (round as unknown as { descriptionUrl?: string | null })?.descriptionUrl ??
    ''
  );
}

export function RoundBasicInfoEditDialog({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  const { confirm } = useConfirm();
  const { mutateAsync: updateBasic } = useUpdateRoundBasic();

  const initialTimeParts = useMemo<InitialTimeParts>(() => {
    // Always use standard times: midnight for starts, end of day for ends
    // This ensures dates start at 00:00:00 and end at 23:59:59 regardless of stored time
    return {
      applicationStartTime: {
        hours: 0,
        minutes: 0,
        seconds: 0,
        ms: 0,
      },
      applicationEndTime: {
        hours: 23,
        minutes: 59,
        seconds: 59,
        ms: 0,
      },
      startTime: {
        hours: 0,
        minutes: 0,
        seconds: 0,
        ms: 0,
      },
      endTime: {
        hours: 23,
        minutes: 59,
        seconds: 59,
        ms: 0,
      },
    };
  }, []);

  const initialDates = useMemo<DateFields>(() => {
    return {
      applicationStartTime: toLocalDateInputValue(round.applicationStartTime),
      applicationEndTime: toLocalDateInputValue(round.applicationEndTime),
      startTime: toLocalDateInputValue(round.startTime),
      endTime: toLocalDateInputValue(round.endTime),
    };
  }, [
    round.applicationStartTime,
    round.applicationEndTime,
    round.startTime,
    round.endTime,
  ]);

  const initialDescriptionUrl = useMemo(
    () => getInitialDescriptionUrl(round),
    [round],
  );

  const [title, setTitle] = useState<string>(round.title ?? '');
  const [description, setDescription] = useState<string>(
    round.description ?? '',
  );
  const [descriptionUrl, setDescriptionUrl] = useState<string>(
    initialDescriptionUrl,
  );
  const [logo, setLogo] = useState<File | null>(null);

  const [applicationStartTime, setApplicationStartTime] = useState<string>(
    initialDates.applicationStartTime,
  );
  const [applicationEndTime, setApplicationEndTime] = useState<string>(
    initialDates.applicationEndTime,
  );
  const [startTime, setStartTime] = useState<string>(initialDates.startTime);
  const [endTime, setEndTime] = useState<string>(initialDates.endTime);

  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
    if (open) setValidationError(null);
  }, []);

  const onCancel = useCallback(() => setOpen(false), []);

  const onReset = useCallback(() => {
    setTitle(round.title ?? '');
    setDescription(round.description ?? '');
    setDescriptionUrl(initialDescriptionUrl ?? '');
    setLogo(null);
    setApplicationStartTime(initialDates.applicationStartTime);
    setApplicationEndTime(initialDates.applicationEndTime);
    setStartTime(initialDates.startTime);
    setEndTime(initialDates.endTime);
    setValidationError(null);
  }, [round.title, round.description, initialDescriptionUrl, initialDates]);

  const validateDateOrdering = useCallback(
    (values: DateFields): { ok: true } | { ok: false; message: string } => {
      if (
        !values.applicationStartTime ||
        !values.applicationEndTime ||
        !values.startTime ||
        !values.endTime
      ) {
        return { ok: false, message: 'All date fields are required.' };
      }

      let appStartIso: string;
      let appEndIso: string;
      let roundStartIso: string;
      let roundEndIso: string;

      try {
        appStartIso = applyLocalDateWithTime(
          values.applicationStartTime,
          initialTimeParts.applicationStartTime,
        );
        appEndIso = applyLocalDateWithTime(
          values.applicationEndTime,
          initialTimeParts.applicationEndTime,
        );
        roundStartIso = applyLocalDateWithTime(
          values.startTime,
          initialTimeParts.startTime,
        );
        roundEndIso = applyLocalDateWithTime(
          values.endTime,
          initialTimeParts.endTime,
        );
      } catch (e) {
        return {
          ok: false,
          message: e instanceof Error ? e.message : 'Invalid date format.',
        };
      }

      if (!(appStartIso < appEndIso)) {
        return {
          ok: false,
          message:
            'Application start date must be before application end date.',
        };
      }

      if (!(roundStartIso < roundEndIso)) {
        return {
          ok: false,
          message: 'Round start date must be before round end date.',
        };
      }

      if (!(appStartIso <= roundStartIso)) {
        return {
          ok: false,
          message:
            'Application start date must be before or equal to round start date.',
        };
      }

      if (!(appEndIso <= roundStartIso)) {
        return {
          ok: false,
          message:
            'Application end date must be before or equal to round start date.',
        };
      }

      return { ok: true };
    },
    [initialTimeParts],
  );

  const onSave = useCallback(async () => {
    setValidationError(null);
    const validation = validateDateOrdering({
      applicationStartTime,
      applicationEndTime,
      startTime,
      endTime,
    });
    if (!validation.ok) {
      setValidationError(validation.message);
      return;
    }

    const nextDates: DateFields = {
      applicationStartTime,
      applicationEndTime,
      startTime,
      endTime,
    };

    const datesChanged =
      nextDates.applicationStartTime !== initialDates.applicationStartTime ||
      nextDates.applicationEndTime !== initialDates.applicationEndTime ||
      nextDates.startTime !== initialDates.startTime ||
      nextDates.endTime !== initialDates.endTime;

    if (datesChanged) {
      const ok = await confirm({
        title: 'Confirm Date Changes',
        description: (
          <DateChangeConfirmDescription
            initialDates={initialDates}
            nextDates={nextDates}
          />
        ),
        confirmText: 'Update dates',
        cancelText: 'Cancel',
        confirmVariant: 'destructive',
        onConfirm: async () => {},
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const startIso = applyLocalDateWithTime(
        startTime,
        initialTimeParts.startTime,
      );
      const endIso = applyLocalDateWithTime(endTime, initialTimeParts.endTime);
      const applicationStartIso = applyLocalDateWithTime(
        applicationStartTime,
        initialTimeParts.applicationStartTime,
      );
      const applicationEndIso = applyLocalDateWithTime(
        applicationEndTime,
        initialTimeParts.applicationEndTime,
      );

      await updateBasic({
        roundId: round.id,
        title,
        description,
        descriptionUrl: descriptionUrl || '',
        // Preserve existing values for fields expected by PATCH endpoint
        matchingPool: round.matchingPool,
        startTime: startIso,
        endTime: endIso,
        applicationStartTime: applicationStartIso,
        applicationEndTime: applicationEndIso,
        tags: Array.isArray(round.tags) ? round.tags : [],
        logo,
      });

      setLogo(null);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }, [
    applicationEndTime,
    applicationStartTime,
    confirm,
    description,
    descriptionUrl,
    endTime,
    initialDates,
    initialTimeParts,
    logo,
    round.id,
    round.matchingPool,
    round.tags,
    startTime,
    title,
    updateBasic,
    validateDateOrdering,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Round</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Basic Info</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {validationError && (
            <Alert variant="destructive">
              <AlertTitle>Invalid dates</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

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
                placeholder="https://example.com"
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

            <div className="space-y-2 md:col-span-2">
              <div className="text-sm font-medium text-foreground">
                Application Period
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="application-start-date">
                Application Start Date
              </Label>
              <Input
                id="application-start-date"
                type="date"
                value={applicationStartTime}
                onChange={(e) => setApplicationStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="application-end-date">Application End Date</Label>
              <Input
                id="application-end-date"
                type="date"
                value={applicationEndTime}
                onChange={(e) => setApplicationEndTime(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="text-sm font-medium text-foreground">
                Round Period
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="round-start-date">Round Start Date</Label>
              <Input
                id="round-start-date"
                type="date"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="round-end-date">Round End Date</Label>
              <Input
                id="round-end-date"
                type="date"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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
