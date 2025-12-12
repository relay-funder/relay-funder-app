'use client';

import type { ReactNode } from 'react';

type Dates = {
  applicationStartTime: string;
  applicationEndTime: string;
  startTime: string;
  endTime: string;
};

function valueClassName(changed: boolean) {
  return [
    'font-mono tabular-nums',
    changed ? 'font-semibold text-foreground' : 'text-muted-foreground',
  ].join(' ');
}

export function DateChangeConfirmDescription({
  initialDates,
  nextDates,
}: {
  initialDates: Dates;
  nextDates: Dates;
}): ReactNode {
  const applicationStartChanged =
    nextDates.applicationStartTime !== initialDates.applicationStartTime;
  const applicationEndChanged =
    nextDates.applicationEndTime !== initialDates.applicationEndTime;
  const roundStartChanged = nextDates.startTime !== initialDates.startTime;
  const roundEndChanged = nextDates.endTime !== initialDates.endTime;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Changing round dates can affect which donations are attributed to this
        round and included in matching calculations.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Before
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-foreground">
                Application period
              </div>
              <dl className="mt-2 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Start</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {initialDates.applicationStartTime}
                </dd>
                <dt className="text-muted-foreground">End</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {initialDates.applicationEndTime}
                </dd>
              </dl>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground">
                Round period
              </div>
              <dl className="mt-2 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Start</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {initialDates.startTime}
                </dd>
                <dt className="text-muted-foreground">End</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {initialDates.endTime}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            After
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-medium text-foreground">
                Application period
              </div>
              <dl className="mt-2 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Start</dt>
                <dd className={valueClassName(applicationStartChanged)}>
                  {nextDates.applicationStartTime}
                </dd>
                <dt className="text-muted-foreground">End</dt>
                <dd className={valueClassName(applicationEndChanged)}>
                  {nextDates.applicationEndTime}
                </dd>
              </dl>
            </div>

            <div>
              <div className="text-sm font-medium text-foreground">
                Round period
              </div>
              <dl className="mt-2 grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Start</dt>
                <dd className={valueClassName(roundStartChanged)}>
                  {nextDates.startTime}
                </dd>
                <dt className="text-muted-foreground">End</dt>
                <dd className={valueClassName(roundEndChanged)}>
                  {nextDates.endTime}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
