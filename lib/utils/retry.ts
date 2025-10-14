export class RetryFetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'RetryFetchError';
  }
}

function calculateDelay(attempt: number, baseDelay: number) {
  const jitter = Math.random() * 500;
  return baseDelay * 2 ** (attempt - 1) + jitter;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type RetryOptions = {
  maxRetries?: number; // default: 4
  baseDelay?: number; // default: 1000
  abortOnStatus?: (status: number) => boolean; // decide which statuses should NOT be retried
};

export async function retryFetchJson<T>(
  url: string,
  init?: RequestInit,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 4,
    baseDelay = 1000,
    // Default per Passport docs: abort on 4xx except 429; retry 429 + 5xx
    abortOnStatus = (status) => status >= 400 && status < 500 && status !== 429,
  } = opts;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return (await res.json()) as T;

      const { status } = res;

      const shouldAbort = abortOnStatus(status);
      throw new RetryFetchError('HTTP error', status, !shouldAbort);
    } catch (error) {
      attempt++;

      if (error instanceof RetryFetchError && !error.retryable) {
        throw error;
      }

      if (attempt > maxRetries) throw error;

      const delay = calculateDelay(attempt, baseDelay);
      await sleep(delay);
    }
  }

  throw new Error('unreachable');
}
