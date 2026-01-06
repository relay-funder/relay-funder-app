export interface RateLimitInfo {
  limit: number;
  remaining: number; // number of requests remaining
  reset: number;
}

export type RateLimitResult = RateLimitInfo & {
  success: boolean;
};

export interface RateLimiter {
  check(identifier: string): Promise<RateLimitResult>;
}

export type RateLimitConfig = {
  requests: number;
  window: number; // in milliseconds
  prefix: string;
};
