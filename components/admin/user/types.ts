/**
 * Shared types and helpers for Admin User components
 *
 * These are intentionally framework-agnostic so they can be imported
 * by both client and server modules as needed.
 */

import { GetUserResponseInstance } from '@/lib/api/types';

export type UserCounts = {
  collections?: number;
  payments?: number;
  paymentMethods?: number;
  createdMedia?: number;
  withdrawals?: number;
  approvals?: number;
  campaigns?: number;
};

/**
 * A small utility to express nullable values.
 */
export type Nullable<T> = T | null | undefined;

/**
 * Returns a shortened, user-friendly representation of an address-like string.
 * Example: 0x1234567890abcdef -> 0x123456…cdef
 */
export function shorten(addr?: Nullable<string>, head = 6, tail = 4): string {
  if (!addr) {
    return '—';
  }
  const s = String(addr);
  if (s.length <= head + tail + 1) {
    return s;
  }
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

/**
 * Returns a displayable string or a fallback em dash when empty.
 */
export function safeString(value?: Nullable<string>, fallback = '—'): string {
  if (value === null) {
    return fallback;
  }
  const trimmed = `${value}`.trim();
  return trimmed.length ? trimmed : fallback;
}

/**
 * Compute a user's display name using username, name parts, or a fallback.
 */
export function getDisplayName(
  user: Pick<GetUserResponseInstance, 'username' | 'firstName' | 'lastName'>,
): string {
  return (
    user.username ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    '—'
  );
}

/**
 * Compute the total asset count for a user from their counts object.
 */
export function getTotalAssets(counts?: Nullable<UserCounts>): number {
  const c = counts ?? {};
  return (c.collections ?? 0) + (c.createdMedia ?? 0) + (c.paymentMethods ?? 0);
}

/**
 * Extract the first N roles and, if there are more, the overflow count.
 * Useful for rendering compact role badges.
 */
export function sliceRoles(
  roles: readonly string[] | Nullable<string[]>,
  visible = 2,
): { visible: string[]; overflow: number } {
  const list = Array.isArray(roles) ? roles : [];
  const vis = list.slice(0, Math.max(0, visible));
  const overflow = Math.max(0, list.length - vis.length);
  return { visible: vis, overflow };
}

/**
 * Type guard that checks for a non-empty checksummed/hex-like address string.
 * This is intentionally permissive and only checks basic shape.
 */
export function isPlausibleAddress(addr: unknown): addr is string {
  if (typeof addr !== 'string') {
    return false;
  }
  const s = addr.trim();
  // Allow 0x-prefixed 40+ hex chars or any 30+ length alphanumeric for flexibility.
  return /^0x[0-9a-fA-F]{8,}$/.test(s) || /^[a-zA-Z0-9]{30,}$/.test(s);
}
