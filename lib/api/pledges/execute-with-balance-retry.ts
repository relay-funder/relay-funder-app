import { ethers } from '@/lib/web3';
import { executeGatewayPledge } from './execute-gateway-pledge';
import { pollForTransactionReceipt } from '@/lib/web3/transaction-polling';
import { NEXT_PUBLIC_RPC_URL } from '@/lib/constant/server';
import { logFactory } from '@/lib/debug';
import type { ExecuteGatewayPledgeResponse } from '@/lib/api/types/pledges';

const logVerbose = logFactory('verbose', '🔄 BalanceRetry', { flag: 'daimo' });
const logError = logFactory('error', '🚨 BalanceRetry', { flag: 'daimo' });

/**
 * Configuration for balance retry execution
 */
export interface BalanceRetryConfig {
  /** Maximum number of retry attempts for insufficient balance errors */
  maxRetries: number;
  /** Base delay in milliseconds for exponential backoff */
  baseDelayMs: number;
  /** Maximum delay between retries in milliseconds */
  maxDelayMs: number;
  /** Timeout for waiting for Daimo destination tx confirmation (ms) */
  destinationTxTimeoutMs: number;
  /** Poll interval for checking destination tx receipt (ms) */
  destinationTxPollIntervalMs: number;
}

/**
 * Default configuration optimized for Daimo Pay timing
 *
 * Daimo's on-chain transfer typically confirms within 5-30 seconds on Celo.
 * We use exponential backoff starting at 3 seconds, with max 5 retries.
 *
 * Retry schedule (approximate):
 * - Attempt 1: immediate
 * - Attempt 2: 3s delay
 * - Attempt 3: 6s delay
 * - Attempt 4: 12s delay
 * - Attempt 5: 24s delay
 * - Attempt 6: 30s delay (capped)
 *
 * Total max time: ~75 seconds of retries
 */
export const DEFAULT_BALANCE_RETRY_CONFIG: BalanceRetryConfig = {
  maxRetries: 5,
  baseDelayMs: 3000,
  maxDelayMs: 30000,
  destinationTxTimeoutMs: 60000, // 60 seconds to wait for destination tx
  destinationTxPollIntervalMs: 2000, // Poll every 2 seconds
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  // Exponential backoff: baseDelay * 2^(attempt-1)
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  // Add jitter (0-500ms) to prevent thundering herd
  const jitter = Math.random() * 500;
  return cappedDelay + jitter;
}

/**
 * Check if an error is an insufficient balance error that should be retried
 */
function isInsufficientBalanceError(error: string | undefined): boolean {
  if (!error) return false;
  return error.toLowerCase().includes('insufficient admin wallet balance');
}

/**
 * Wait for Daimo's destination transaction to be confirmed on-chain.
 *
 * This ensures the funds have actually arrived in the admin wallet
 * before attempting to execute the pledge.
 *
 * @param destinationTxHash - The transaction hash from Daimo's destination transfer
 * @param config - Retry configuration
 * @param context - Logging context
 * @returns true if transaction confirmed successfully, false if timeout/error
 */
async function waitForDaimoDestinationTx(
  destinationTxHash: string,
  config: BalanceRetryConfig,
  context: { prefixId: string; logAddress: string; paymentId: number },
): Promise<{ confirmed: boolean; receipt?: ethers.TransactionReceipt }> {
  const rpcUrl = NEXT_PUBLIC_RPC_URL;

  if (!rpcUrl) {
    logError('Missing RPC URL for destination tx verification', context);
    return { confirmed: false };
  }

  logVerbose('Waiting for Daimo destination transaction confirmation', {
    ...context,
    destinationTxHash,
    timeoutMs: config.destinationTxTimeoutMs,
    pollIntervalMs: config.destinationTxPollIntervalMs,
  });

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const receipt = await pollForTransactionReceipt(
      provider,
      destinationTxHash,
      config.destinationTxPollIntervalMs,
      config.destinationTxTimeoutMs,
      context,
    );

    if (receipt && receipt.status === 1) {
      logVerbose('Daimo destination transaction confirmed successfully', {
        ...context,
        destinationTxHash,
        blockNumber: receipt.blockNumber,
        status: 'SUCCESS',
      });
      return { confirmed: true, receipt };
    } else if (receipt && receipt.status !== 1) {
      logError('Daimo destination transaction failed/reverted', {
        ...context,
        destinationTxHash,
        status: receipt.status,
      });
      return { confirmed: false, receipt };
    } else {
      logError('Daimo destination transaction not found within timeout', {
        ...context,
        destinationTxHash,
        timeoutMs: config.destinationTxTimeoutMs,
      });
      return { confirmed: false };
    }
  } catch (error) {
    logError('Error waiting for Daimo destination transaction', {
      ...context,
      destinationTxHash,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { confirmed: false };
  }
}

/**
 * Execute gateway pledge with automatic retry for insufficient balance errors.
 *
 * This function handles the race condition where Daimo's webhook fires before
 * the on-chain transfer is fully confirmed. It:
 *
 * 1. Optionally waits for Daimo's destination transaction to be confirmed
 * 2. Attempts pledge execution
 * 3. If insufficient balance error occurs, retries with exponential backoff
 *
 * This is specifically designed for the timing issue where:
 * - Daimo sends payment_completed webhook
 * - Webhook immediately fires executeGatewayPledge()
 * - But Daimo's on-chain transfer may not be confirmed yet
 * - Admin wallet balance check fails
 *
 * @param paymentId - Internal payment record ID
 * @param destinationTxHash - Optional Daimo destination tx hash to wait for
 * @param config - Retry configuration (uses defaults if not provided)
 * @param context - Logging context
 * @returns Execution result
 */
export async function executeGatewayPledgeWithBalanceRetry(
  paymentId: number,
  destinationTxHash: string | undefined | null,
  config: BalanceRetryConfig = DEFAULT_BALANCE_RETRY_CONFIG,
  context: { prefixId: string; logAddress: string },
): Promise<ExecuteGatewayPledgeResponse> {
  const executionContext = { ...context, paymentId };

  logVerbose('Starting gateway pledge execution with balance retry', {
    ...executionContext,
    destinationTxHash: destinationTxHash || 'not provided',
    maxRetries: config.maxRetries,
    baseDelayMs: config.baseDelayMs,
  });

  // Step 1: If destination tx hash is provided, wait for it to be confirmed
  // This is the primary fix - ensure funds have actually arrived before checking balance
  if (destinationTxHash) {
    logVerbose('Destination tx hash provided - waiting for confirmation first', {
      ...executionContext,
      destinationTxHash,
    });

    const { confirmed, receipt } = await waitForDaimoDestinationTx(
      destinationTxHash,
      config,
      { ...executionContext, paymentId },
    );

    if (confirmed) {
      logVerbose('Destination tx confirmed - proceeding with pledge execution', {
        ...executionContext,
        destinationTxHash,
        blockNumber: receipt?.blockNumber,
      });
    } else {
      // Even if we couldn't confirm the destination tx, we'll still try pledge execution
      // with retries as a fallback. The funds might have arrived but RPC is slow.
      logVerbose(
        'Could not confirm destination tx - proceeding with retry-based approach',
        {
          ...executionContext,
          destinationTxHash,
          note: 'Will retry with exponential backoff if balance insufficient',
        },
      );
    }
  } else {
    logVerbose(
      'No destination tx hash provided - will use retry-based approach only',
      executionContext,
    );
  }

  // Step 2: Execute with retry loop for insufficient balance errors
  let lastResult: ExecuteGatewayPledgeResponse | null = null;
  let attempt = 0;

  while (attempt <= config.maxRetries) {
    attempt++;

    logVerbose(`Pledge execution attempt ${attempt}/${config.maxRetries + 1}`, {
      ...executionContext,
      attempt,
      maxAttempts: config.maxRetries + 1,
    });

    try {
      const result = await executeGatewayPledge(paymentId);
      lastResult = result;

      if (result.success) {
        logVerbose('Pledge execution succeeded', {
          ...executionContext,
          attempt,
          pledgeId: result.pledgeId,
          transactionHash: result.transactionHash,
        });
        return result;
      }

      // Check if this is an insufficient balance error that should be retried
      if (isInsufficientBalanceError(result.error) && attempt <= config.maxRetries) {
        const delay = calculateBackoffDelay(
          attempt,
          config.baseDelayMs,
          config.maxDelayMs,
        );

        logVerbose(
          `Insufficient balance - waiting ${delay}ms before retry ${attempt + 1}`,
          {
            ...executionContext,
            attempt,
            nextAttempt: attempt + 1,
            delayMs: delay,
            error: result.error,
          },
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or max retries exceeded
      logError('Pledge execution failed with non-retryable error', {
        ...executionContext,
        attempt,
        error: result.error,
        isInsufficientBalance: isInsufficientBalanceError(result.error),
        retriesRemaining: config.maxRetries - attempt,
      });

      return result;
    } catch (error) {
      // Unexpected exception during execution
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if the exception message indicates insufficient balance
      if (
        isInsufficientBalanceError(errorMessage) &&
        attempt <= config.maxRetries
      ) {
        const delay = calculateBackoffDelay(
          attempt,
          config.baseDelayMs,
          config.maxDelayMs,
        );

        logVerbose(
          `Insufficient balance (exception) - waiting ${delay}ms before retry ${attempt + 1}`,
          {
            ...executionContext,
            attempt,
            nextAttempt: attempt + 1,
            delayMs: delay,
            error: errorMessage,
          },
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable exception
      logError('Pledge execution threw unexpected exception', {
        ...executionContext,
        attempt,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        success: false,
        paymentId,
        error: errorMessage,
      } as ExecuteGatewayPledgeResponse;
    }
  }

  // Max retries exceeded
  logError('Max retries exceeded for insufficient balance', {
    ...executionContext,
    totalAttempts: attempt,
    maxRetries: config.maxRetries,
    lastError: lastResult?.error || 'Unknown',
  });

  return (
    lastResult || {
      success: false,
      paymentId,
      error: `Max retries (${config.maxRetries}) exceeded waiting for sufficient balance`,
    }
  );
}
