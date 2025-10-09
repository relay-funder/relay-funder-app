import { PostgresRateLimiter } from './postgress-rate-limiter';
import { RateLimitConfig, RateLimiter } from './types';

export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  const provider = process.env.RATE_LIMIT_PROVIDER || 'postgres';

  switch (provider) {
    case 'upstash':
    //   return new UpstashRateLimiter(config);
    case 'postgres':
    default:
      return new PostgresRateLimiter(config);
  }
}
