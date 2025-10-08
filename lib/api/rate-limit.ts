import { debugApi as debug } from '@/lib/debug';
import { RATE_LIMITS } from '@/lib/constant';
import { db } from '@/server/db';
import type {
  RateLimit,
  RateLimitResult,
  RateLimits,
  RateLimitsEntry,
} from './types';
import { getClientIp } from './ip';

class RateLimiter {
  constructor(private rateLimits: RateLimits) {}

  getRateLimits(route: string) {
    return this.rateLimits[route];
  }

  setRateLimits(route: string, limits: RateLimitsEntry) {
    this.rateLimits[route] = {
      user: limits.user ? { ...limits.user } : undefined,
      ip: limits.ip ? { ...limits.ip } : undefined,
    };
    debug && console.debug('[rate-limit] set rate limits', route, limits);
  }

  setRateLimit(route: string, type: keyof RateLimitsEntry, limit: RateLimit) {
    this.rateLimits[route] = {
      ...this.rateLimits[route],
      [type]: limit,
    };
    debug && console.debug('[rate-limit] set rate limit', route, type, limit);
  }

  clearRateLimits(route: string) {
    delete this.rateLimits[route];
    debug && console.debug('[rate-limit] clear rate limits', route);
  }

  async consume(
    route: string,
    type: keyof RateLimitsEntry,
    value: string,
  ): Promise<RateLimitResult> {
    const result = await this.check(route, type, value);
    if (result.allowed) {
      await this.registerAttempt(route, type, value);
    }
    return result;
  }

  async check(
    route: string,
    type: keyof RateLimitsEntry,
    value: string,
  ): Promise<RateLimitResult> {
    if (!this.rateLimits[route]?.[type]) {
      return { allowed: true, remaining: Infinity };
    }
    const { limit, window } = this.rateLimits[route][type];
    const since = new Date(Date.now() - window);

    const { count, firstAttempt } = await this.checkAttempts(
      route,
      type,
      value,
      since,
    );

    const allowed = count < limit;
    const remaining = Math.max(0, limit - count);

    if (allowed) return { allowed, remaining };

    const nextAttemptAt = firstAttempt?.getTime()
      ? firstAttempt.getTime() + window
      : undefined;

    return {
      allowed,
      remaining,
      nextAttemptAt,
    };
  }

  private async registerAttempt(
    route: string,
    type: keyof RateLimitsEntry,
    value: string,
  ) {
    await db.apiAudit
      .create({
        data: { route, [type]: value },
      })
      .catch(() => {
        debug &&
          console.error(
            `[rate-limit] failed to register attempt for route: ${route} - ip: ${value} - user: ${value}`,
          );
      });

    debug &&
      console.log(
        `[rate-limit] registered attempt for route: ${route} - ip: ${value} - user: ${value}`,
      );
  }

  private async checkAttempts(
    route: string,
    type: 'ip' | 'user',
    value: string,
    since: Date,
  ) {
    const { _count, _min } = await db.apiAudit.aggregate({
      where: {
        route,
        [type]: value,
        createdAt: { gte: since },
      },
      _count: true,
      _min: { createdAt: true },
    });
    return { count: _count || 0, firstAttempt: _min?.createdAt };
  }
}

export const rateLimiter = new RateLimiter(RATE_LIMITS);

export async function checkIpRateLimit(
  route: string,
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  return rateLimiter.consume(route, 'ip', ip);
}

export async function checkUserRateLimit(
  route: string,
  user: string,
): Promise<RateLimitResult> {
  return rateLimiter.consume(route, 'user', user.toLowerCase());
}
