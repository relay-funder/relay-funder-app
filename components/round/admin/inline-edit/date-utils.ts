'use client';

import { validateAndParseDateString } from '@/lib/utils/date';

export type TimeParts = {
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
};

export function toLocalDateInputValue(
  dateString: string | null | undefined,
): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function applyLocalDateWithTime(value: string, time: TimeParts): string {
  const { year, month, day } = validateAndParseDateString(value);
  const date = new Date(
    year,
    month - 1,
    day,
    time.hours,
    time.minutes,
    time.seconds,
    time.ms,
  );
  return date.toISOString();
}
