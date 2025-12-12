'use client';

import { validateAndParseDateString } from '@/lib/utils/date';

export type TimeParts = {
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
};

/**
 * Converts an ISO timestamp to a YYYY-MM-DD date input value.
 * Uses UTC methods to ensure calendar dates are consistent across timezones.
 * For example, 2024-01-15T23:59:59Z displays as 2024-01-15 for all admins,
 * not 2024-01-16 for admins in UTC+8.
 */
export function toLocalDateInputValue(
  dateString: string | null | undefined,
): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  // Use UTC methods to ensure consistent calendar date interpretation
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Applies time components to a calendar date and returns an ISO timestamp.
 * Uses UTC-based construction to ensure calendar dates are interpreted consistently
 * across all admin timezones. For example, "2024-01-15" with time 00:00:00
 * creates 2024-01-15T00:00:00Z regardless of admin's local timezone.
 */
export function applyLocalDateWithTime(value: string, time: TimeParts): string {
  const { year, month, day } = validateAndParseDateString(value);
  // Use Date.UTC to construct date in UTC, ensuring consistent calendar date interpretation
  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      time.hours,
      time.minutes,
      time.seconds,
      time.ms,
    ),
  );
  return date.toISOString();
}
