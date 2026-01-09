import type { ZodType, ZodTypeAny, infer as ZodInfer } from 'zod';
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

export type RetryOptions<T = unknown> = {
  maxRetries?: number; // default: 4
  baseDelay?: number; // default: 1000
  abortOnStatus?: (status: number) => boolean; // decide which statuses should NOT be retried
  schema?: ZodType<T>; // optional runtime validation for the JSON response
};

// Overload: schema provided -> infer return type from schema
export function retryFetchJson<S extends ZodTypeAny>(
  url: string,
  init?: RequestInit,
  opts?: Omit<RetryOptions<ZodInfer<S>>, 'schema'> & { schema: S },
): Promise<ZodInfer<S>>;
// Overload: no schema -> use generic T
export function retryFetchJson<T>(
  url: string,
  init?: RequestInit,
  opts?: RetryOptions<T>,
): Promise<T>;
// Implementation
export async function retryFetchJson<T>(
  url: string,
  init?: RequestInit,
  opts: RetryOptions<T> = {},
): Promise<T> {
  const {
    maxRetries = 4,
    baseDelay = 1000,
    // Default per Passport docs: abort on 4xx except 429; retry 429 + 5xx
    abortOnStatus = (status) => status >= 400 && status < 500 && status !== 429,
    schema,
  } = opts;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, init);
      if (res.ok) {
        let json: unknown;
        try {
          json = await res.json();
        } catch (_) {
          throw new RetryFetchError('Invalid JSON response', res.status, false);
        }

        if (schema) {
          const result = schema.safeParse(json);
          if (!result.success) {
            const issues = result.error.issues
              .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
              .join('; ');
            throw new RetryFetchError(
              `Response validation failed: ${issues}`,
              res.status,
              false,
            );
          }
          return result.data as T;
        }

        return json as T;
      }

      const { status } = res;

      const shouldAbort = abortOnStatus(status);
      throw new RetryFetchError('HTTP error', status, !shouldAbort);
    } catch (error) {
      attempt++;

      if (error instanceof RetryFetchError && !error.retryable) {
        throw error;
      }

      if (attempt > maxRetries) {
        throw error;
      }

      const delay = calculateDelay(attempt, baseDelay);
      await sleep(delay);
    }
  }

  throw new Error('unreachable');
}

export function retryFetchJsonWithSchema<S extends ZodTypeAny>(
  schema: S,
  url: string,
  init?: RequestInit,
  opts?: Omit<RetryOptions<ZodInfer<S>>, 'schema'>,
): Promise<ZodInfer<S>> {
  return retryFetchJson(url, init, {
    ...(opts as object),
    schema,
  } as RetryOptions<ZodInfer<S>>);
}
