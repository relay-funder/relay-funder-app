import { db } from '@/server/db';
import { RateLimitConfig, RateLimiter, RateLimitResult } from './types';

export class PostgresRateLimiter implements RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.prefix}:${identifier}`;
    const now = Date.now();
    const windowMs = this.config.window;
    const expiredWindow = new Date(now - windowMs);

    const result = await db.$transaction(async (tx) => {
      await tx.rateLimit.deleteMany({
        where: {
          identifier: key,
          windowStart: { lt: expiredWindow },
        },
      });

      const record = await tx.rateLimit.upsert({
        where: { identifier: key },
        create: {
          identifier: key,
          requests: 1,
          windowStart: new Date(),
        },
        update: {
          requests: { increment: 1 },
        },
      });

      const resetAt = record.windowStart.getTime() + windowMs;
      const remaining = Math.max(0, this.config.requests - record.requests);

      return {
        success: record.requests <= this.config.requests,
        limit: this.config.requests,
        remaining,
        reset: resetAt,
      };
    });

    return result;
  }
}
