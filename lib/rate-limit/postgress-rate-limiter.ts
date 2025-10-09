import { db } from '@/server/db';
import { ONE_DAY_MS, ONE_MINUTE_MS, ONE_SECOND_MS } from '@/lib/constant/time';
import { RateLimitConfig, RateLimiter, RateLimitResult } from './types';

export class PostgresRateLimiter implements RateLimiter {
  private config: RateLimitConfig;
  private lastCleanup = 0;
  private cleanupInterval = 5 * ONE_MINUTE_MS; // 5 minutes

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private async maybeCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupInterval) {
      return;
    }

    this.lastCleanup = now;

    // Non-blocking cleanup in background
    db.rateLimit
      .deleteMany({
        where: {
          windowStart: {
            lt: new Date(now - ONE_DAY_MS),
          },
        },
      })
      .catch((err) => console.error('Cleanup error:', err));
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.config.prefix}:${identifier}`;
    const now = Date.now();
    const windowMs = this.config.window * ONE_SECOND_MS;
    const windowStart = new Date(now - windowMs);

    // Trigger periodic cleanup (non-blocking)
    this.maybeCleanup();

    const result = await db.$transaction(async (tx) => {
      // Delete only this identifier's old windows
      await tx.rateLimit.deleteMany({
        where: {
          identifier: key,
          windowStart: { lt: windowStart },
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
