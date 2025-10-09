import type { NextRequest } from 'next/server';

export function getClientIp(headers: Headers | NextRequest['headers']): string {
  // Used by Vercel
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return headers.get('x-real-ip') ?? '127.0.0.1';
}
