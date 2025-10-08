import { headers } from 'next/headers';
import { debugApi as debug } from '@/lib/debug';

type WindowStore = Map<string, { count: number; resetAt: number }>;

// Simple in-memory rate limiter. For multi-instance deployments, replace with Redis/Upstash.
class FixedWindowRateLimiter {
  private store: WindowStore = new Map();

  constructor(
    private windowMs: number,
    private limit: number,
  ) {}

  consume(key: string) {
    const now = Date.now();
    const current = this.store.get(key);
    if (!current || current.resetAt <= now) {
      const resetAt = now + this.windowMs;
      const count = 1;
      this.store.set(key, { count, resetAt });
      const result = {
        allowed: true,
        remaining: this.limit - 1,
        resetAt,
      };
      debug &&
        console.debug('[rate-limit] reset/new window', {
          key,
          result,
          count,
          windowMs: this.windowMs,
          limit: this.limit,
        });
      return result;
    }
    if (current.count < this.limit) {
      current.count += 1;
      const result = {
        allowed: true,
        remaining: this.limit - current.count,
        resetAt: current.resetAt,
      };
      debug &&
        console.debug('[rate-limit] within window', {
          key,
          result,
          count: current.count,
        });
      return result;
    }
    const result = { allowed: false, remaining: 0, resetAt: current.resetAt };
    debug &&
      console.debug('[rate-limit] limit exceeded', {
        key,
        result,
        count: current.count,
      });
    return result;
  }

  get(key: string) {
    return this.store.get(key);
  }

  getAll() {
    return Object.fromEntries(
      this.store.entries().map(([key, value]) => [key, value]),
    );
  }

  getKeys() {
    return Array.from(this.store.keys()).sort();
  }

  reset(key: string) {
    this.store.delete(key);
    debug && console.debug('[rate-limit] reset key', { key });
  }

  resetAll() {
    this.store.clear();
    debug && console.debug('[rate-limit] reset all keys');
  }

  setLimit(limit: number) {
    if (!Number.isFinite(limit) || limit < 0) return;
    this.limit = Math.floor(limit);
    debug && console.debug('[rate-limit] limit updated', { limit: this.limit });
  }

  setWindow(windowMs: number) {
    if (!Number.isFinite(windowMs) || windowMs < 0) return;
    this.windowMs = Math.floor(windowMs);
    debug &&
      console.debug('[rate-limit] window updated', { windowMs: this.windowMs });
  }

  setConfig(config: { limit?: number; windowMs?: number }) {
    typeof config.limit === 'number' && this.setLimit(config.limit);
    typeof config.windowMs === 'number' && this.setWindow(config.windowMs);
    debug && console.debug('[rate-limit] config updated', { config });
  }

  getConfig() {
    return { limit: this.limit, windowMs: this.windowMs };
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export const getClientIp = async () => {
  const h = await headers();
  // Standard headers through proxies/CDNs
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    h.get('fastly-client-ip') ||
    h.get('x-cluster-client-ip') ||
    h.get('x-forwarded') ||
    h.get('forwarded-for') ||
    h.get('forwarded') ||
    'unknown';
  debug && ip === 'unknown' && console.debug('[rate-limit] unknown client ip');
  return ip;
};

// Configurable buckets
const ONE_MINUTE = 60_000;
const ONE_DAY = 86_400_000;

// Per-IP short window throttle
const ipRateLimiter = new FixedWindowRateLimiter(
  parseInt(process.env.CAMPAIGN_CREATE_IP_WINDOW_MS || '', 10) || ONE_MINUTE,
  parseInt(process.env.CAMPAIGN_CREATE_IP_LIMIT || '', 10) || 20,
);

// Per-user daily limit
const userRateLimiter = new FixedWindowRateLimiter(
  parseInt(process.env.CAMPAIGN_CREATE_USER_WINDOW_MS || '', 10) || ONE_DAY,
  parseInt(process.env.CAMPAIGN_CREATE_USER_LIMIT || '', 10) || 5,
);

export async function checkIpLimit(prefix: string): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return ipRateLimiter.consume(`${prefix}:ip:${ip}`);
}

export function checkUserDailyLimit(
  prefix: string,
  user: string,
): RateLimitResult {
  return userRateLimiter.consume(`${prefix}:user:${user.toLowerCase()}`);
}
