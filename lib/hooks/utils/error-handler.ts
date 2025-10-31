import { QfCalculationError } from '@/lib/qf/error';
import { z } from 'zod';

/**
 * Handles API responses for QF (Quadratic Funding) calculations with error handling and optional schema validation.
 *
 * @template T - The expected return type of the API response
 * @param response - The fetch Response object from the API call
 * @param defaultErrorMessage - Fallback error message if no specific error is provided
 * @param schema - Optional Zod schema to validate the response data
 * @returns Promise that resolves to the parsed and validated response data
 * @throws {QfCalculationError} When the response is not ok or validation fails
 *
 * @example
 * ```typescript
 * const data = await handleQfApiResponse(
 *   response,
 *   'Failed to fetch QF data',
 *   QfCalculationResultSchema
 * );
 * ```
 */
export async function handleQfApiResponse<T>(
  response: Response,
  defaultErrorMessage: string,
  schema?: z.ZodSchema<T>,
): Promise<T> {
  if (!response.ok) {
    let errorMessage = defaultErrorMessage;
    let errorDetails: unknown;

    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
      if (errorData.details) {
        errorDetails = errorData.details;
      }
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new QfCalculationError(errorMessage, response.status, errorDetails);
  }

  try {
    const data = await response.json();
    return schema ? schema.parse(data) : (data as T);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new QfCalculationError(
        `Invalid response format: ${error.message}`,
        response.status,
        error.errors,
      );
    }

    throw new QfCalculationError(
      'Invalid response format: Expected JSON data',
      response.status,
    );
  }
}

/**
 * Creates a standardized error handler for QF operations that converts various error types
 * into QfCalculationError instances for consistent error handling.
 *
 * @returns A function that takes an unknown error and throws a QfCalculationError
 *
 * @example
 * ```typescript
 * const errorHandler = createQfErrorHandler();
 * try {
 *   // some operation
 * } catch (error) {
 *   errorHandler(error); // Will throw QfCalculationError
 * }
 * ```
 */
export function createQfErrorHandler() {
  return (error: unknown): never => {
    if (error instanceof QfCalculationError) throw error;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new QfCalculationError(
        'Network error: Unable to connect to server',
      );
    }

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new QfCalculationError(`Unexpected error: ${message}`);
  };
}

/**
 * Configuration object for retry logic in QF operations.
 * Defines when to retry failed requests based on error type and status codes.
 *
 * @property retry - Function that determines if a retry should be attempted
 *   - Returns false for 4xx client errors (no retry)
 *   - Returns true for other errors up to 3 attempts
 *
 * @example
 * ```typescript
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: {
 *       retry: qfRetryConfig.retry,
 *     },
 *   },
 * });
 * ```
 */
export const qfRetryConfig = {
  retry: (failureCount: number, error: unknown) => {
    if (
      error instanceof QfCalculationError &&
      error.status &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return false;
    }
    return failureCount < 3;
  },
};
