import type { NextRequest } from 'next/server';
import { ApiRateLimitError } from '../api/error';
import { RateLimiter } from './types';

export function getClientIp(headers: Headers | NextRequest['headers']): string {
  // Used by Vercel
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return headers.get('x-real-ip') ?? '127.0.0.1';
}

export async function checkIpLimit(
  headers: Headers | NextRequest['headers'],
  ipLimiter: RateLimiter,
) {
  const clientIp = getClientIp(headers);
  const ipResult = await ipLimiter.check(clientIp);
  if (!ipResult.success) {
    throw new ApiRateLimitError(
      'Too many requests from this IP. Please try later.',
      ipResult,
    );
  }
  return ipResult;
}

export async function checkUserLimit(user: string, userLimiter: RateLimiter) {
  const userResult = await userLimiter.check(user);
  if (!userResult.success) {
    throw new ApiRateLimitError(
      'Too many requests from this user. Please try later.',
      userResult,
    );
  }
  return userResult;
}
