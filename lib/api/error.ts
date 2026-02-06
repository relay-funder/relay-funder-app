import { RateLimitInfo } from '@/lib/rate-limit/types';

export async function handleApiErrors(
  response: Response,
  defaultMessage: string,
) {
  if (!response.ok) {
    let errorMessage;
    try {
      errorMessage = await response.json();
    } catch {
      errorMessage = { error: `${defaultMessage} (HTTP ${response.status})` };
    }
    const baseMessage = errorMessage?.error || defaultMessage;
    const fullMessage = errorMessage?.details
      ? `${baseMessage}\nDetails: ${JSON.stringify(errorMessage.details, null, 2)}`
      : baseMessage;

    switch (response.status) {
      case 401:
        throw new ApiAuthError(fullMessage);
      case 403:
        throw new ApiAuthNotAllowed(fullMessage);
      case 404:
        throw new ApiNotFoundError(fullMessage);
      case 409:
        throw new ApiConflictError(fullMessage);
      case 400:
      case 422:
        throw new ApiParameterError(baseMessage, errorMessage?.details);
      case 429:
        throw new ApiRateLimitError(fullMessage);
      default:
        throw new Error(fullMessage);
    }
  }
  return response;
}

/**
 * AuthError
 * Error to be thrown from route functions, used for consistent error responses
 */
export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ApiAuthError.prototype);
    this.name = 'AuthError';
  }
}
/**
 * AuthNotAllowedError
 * Error to be thrown from route functions when a functionality is requested that
 * the authenticated user must not use.
 */
export class ApiAuthNotAllowed extends ApiAuthError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ApiAuthNotAllowed.prototype);
    this.name = 'AuthNotAllowedError';
  }
}
/**
 * ParameterError
 * Error to be thrown from route functions.
 * This error indicates that the route was not able to process the request because of bad
 * parameters.
 */
export class ApiParameterError extends Error {
  public details: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    Object.setPrototypeOf(this, ApiParameterError.prototype);
    this.name = 'ParameterError';
    this.details = details;
  }
}
/**
 * NotFoundError
 * Error to be thrown from route functions.
 * This error indicates that the route tried to modify a instance that is not available in the
 * storage
 */
export class ApiNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ApiNotFoundError.prototype);
    this.name = 'NotFoundError';
  }
}
/**
 * Conflict Error
 * Error to be thrown from route functions.
 * This error indicates that the route tried to modify a instance with data that is in
 * conflict with the current state.
 */
export class ApiConflictError extends Error {
  public code?: string;
  public publicMessage?: string;

  constructor(
    message: string,
    options?: {
      code?: string;
      publicMessage?: string;
    },
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiConflictError.prototype);
    this.name = 'ConflictError';
    this.code = options?.code;
    this.publicMessage = options?.publicMessage;
  }
}
/**
 * Upstream Error
 * Error to be thrown from route functions.
 * This error indicates that the route tried to call a upstream service and failed
 */
export class ApiUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ApiUpstreamError.prototype);
    this.name = 'UpstreamError';
  }
}
/**
 * Integrity Error
 * Error to be thrown from route functions.
 * This error indicates that the route tried to modify a instance that does not match
 * integrity checks
 */
export class ApiIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ApiIntegrityError.prototype);
    this.name = 'IntegrityError';
  }
}

/**
 * Rate Limit Error
 * Error to be thrown from route functions.
 * This error indicates that the route was executed too frequently
 */
export class ApiRateLimitError extends Error {
  public reset?: number;
  public limit?: number;
  public remaining?: number;

  constructor(message: string, rateLimitInfo?: RateLimitInfo) {
    super(message);
    Object.setPrototypeOf(this, ApiRateLimitError.prototype);
    this.name = 'RateLimitError';
    if (rateLimitInfo) {
      this.reset = rateLimitInfo.reset;
      this.limit = rateLimitInfo.limit;
      this.remaining = rateLimitInfo.remaining;
    }
  }
}
