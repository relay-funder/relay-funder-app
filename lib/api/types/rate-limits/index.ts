export interface RateLimit {
  window: number;
  limit: number;
}

export interface RateLimitsEntry {
  ip?: RateLimit;
  user?: RateLimit;
}

export interface RateLimits {
  [key: string]: RateLimitsEntry;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  nextAttemptAt?: number;
}
