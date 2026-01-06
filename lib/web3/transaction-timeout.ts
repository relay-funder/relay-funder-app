import { ApiUpstreamError } from '@/lib/api/error';
import { logFactory } from '@/lib/debug';

const logVerbose = logFactory('verbose', '⏱️  Timeout');
const logError = logFactory('error', '🚨 Timeout');

/**
 * Timeout Wrapper for Blockchain Operations
 *
 * Prevents indefinite hangs on blockchain operations by racing the operation
 * against a timeout. This is critical for gateway pledge execution where
 * RPC failures or network issues can cause operations to hang forever.
 *
 * Usage:
 * ```typescript
 * const receipt = await waitWithTimeout(
 *   tx.wait(),
 *   90000, // 90 seconds
 *   'setFeeAndPledge transaction confirmation'
 * );
 * ```
 */

/**
 * Race a promise against a timeout.
 *
 * If the promise completes first, returns its result.
 * If the timeout occurs first, throws ApiUpstreamError with details.
 *
 * @param promise - The promise to execute with timeout protection
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Human-readable description of the operation (for logging/errors)
 * @param context - Optional context information for logging (e.g., paymentId, txHash)
 * @returns The result of the promise if it completes before timeout
 * @throws ApiUpstreamError if timeout occurs
 * @throws Original error if promise rejects before timeout
 */
export async function waitWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string,
  context?: Record<string, unknown>,
): Promise<T> {
  const startTime = Date.now();

  logVerbose(`Starting operation with ${timeoutMs}ms timeout`, {
    operation,
    timeoutMs,
    ...context,
  });

  // Track the timeout timer ID so we can clear it
  let timeoutId: NodeJS.Timeout | null = null;

  // Create a timeout promise that rejects after timeoutMs
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      const error = new ApiUpstreamError(
        `Operation timed out after ${elapsed}ms: ${operation}`,
      );

      logError('Operation timeout', {
        operation,
        timeoutMs,
        elapsed,
        ...context,
      });

      reject(error);
    }, timeoutMs);
  });

  try {
    // Race the operation against the timeout
    const result = await Promise.race([promise, timeoutPromise]);

    // Clear the timeout immediately to prevent timer leak
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    const elapsed = Date.now() - startTime;
    logVerbose(`Operation completed successfully`, {
      operation,
      elapsed: `${elapsed}ms`,
      timeoutMs,
      ...context,
    });

    return result;
  } catch (error) {
    // Clear the timeout immediately to prevent timer leak
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    const elapsed = Date.now() - startTime;

    // Check if this is a timeout error (our ApiUpstreamError)
    if (
      error instanceof ApiUpstreamError &&
      error.message.includes('timed out')
    ) {
      logError('Operation timed out', {
        operation,
        timeoutMs,
        elapsed: `${elapsed}ms`,
        ...context,
      });
      throw error;
    }

    // Otherwise, it's an error from the original promise
    logError('Operation failed', {
      operation,
      elapsed: `${elapsed}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...context,
    });

    throw error;
  }
}

/**
 * Recommended timeout values for common blockchain operations.
 *
 * IMPORTANT: Vercel serverless function limits (Pro plan):
 * - Max execution time: 300 seconds (5 minutes)
 * - Our timeouts must fit within this limit
 *
 * Worst-case timing with polling fallback:
 * - Approval: 60s (tx.wait) + 60s (polling) = 120s max
 * - Pledge: 30s (tx.wait) + 60s (polling) = 90s max
 * - Total: 210s (3.5 minutes) - fits within Vercel 5-minute limit
 *
 * NOTE: If RPC is slower, lambda will timeout but tx hash is saved to DB,
 * allowing manual verification via CeloScan or recovery via retry endpoint.
 */
export const TIMEOUT_VALUES = {
  /** Balance/allowance reads - fast operations */
  READ_OPERATION: 30000, // 30 seconds

  /** Token approval transaction confirmation (with polling fallback) */
  APPROVAL_TX: 60000, // 60 seconds (1 minute) - try tx.wait(), then poll for another 60s

  /** setFeeAndPledge transaction confirmation (typically fast, ~4-5 seconds) */
  PLEDGE_TX: 30000, // 30 seconds - try tx.wait(), then poll for another 60s

  /**
   * Overall execution timeout (sum of all operations + buffer)
   * Must fit within Vercel Pro 300s limit: approval (120s) + pledge (90s) + buffer (30s) = 240s
   */
  OVERALL_EXECUTION: 240000, // 240 seconds (4 minutes) - fits within Vercel 5-minute limit with buffer
} as const;

/**
 * Convenience wrapper for transaction wait() with timeout.
 *
 * Automatically uses appropriate timeout for transaction confirmations.
 *
 * @param tx - Transaction response object with wait() method
 * @param operation - Description of the transaction
 * @param context - Optional context for logging
 * @returns Transaction receipt
 */
export async function waitForTransaction<
  T extends { wait: () => Promise<R>; hash?: string },
  R,
>(tx: T, operation: string, context?: Record<string, unknown>): Promise<R> {
  const txContext = {
    ...context,
    txHash: tx.hash,
  };

  return waitWithTimeout(
    tx.wait(),
    TIMEOUT_VALUES.PLEDGE_TX,
    operation,
    txContext,
  );
}
