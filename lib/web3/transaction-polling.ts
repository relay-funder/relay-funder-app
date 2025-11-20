import { ethers } from 'ethers';
import { logFactory } from '@/lib/debug';

const logVerbose = logFactory('verbose', '⏱️  TxPolling');
const logError = logFactory('error', '🚨 TxPolling');

/**
 * Poll for transaction confirmation by checking receipt
 * This is more reliable than tx.wait() when RPC providers are slow
 *
 * @param provider - Ethers provider
 * @param txHash - Transaction hash
 * @param pollIntervalMs - Interval between polls (default 2000ms)
 * @param timeoutMs - Maximum time to poll (default 240000ms = 4 minutes)
 * @param context - Logging context
 * @returns Transaction receipt or null if not found within timeout
 */
export async function pollForTransactionReceipt(
  provider: ethers.Provider,
  txHash: string,
  pollIntervalMs: number = 2000,
  timeoutMs: number = 240000,
  context?: Record<string, unknown>,
): Promise<ethers.TransactionReceipt | null> {
  const startTime = Date.now();
  let attempts = 0;

  logVerbose('Starting transaction receipt polling', {
    ...context,
    txHash,
    pollIntervalMs,
    timeoutMs,
  });

  while (Date.now() - startTime < timeoutMs) {
    attempts++;

    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (receipt) {
        const elapsed = Date.now() - startTime;
        logVerbose('Transaction receipt found', {
          ...context,
          txHash,
          blockNumber: receipt.blockNumber,
          status: receipt.status ? 'SUCCESS' : 'FAILED',
          attempts,
          elapsed: `${elapsed}ms`,
        });
        return receipt;
      }

      // Receipt not found yet, wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      const elapsed = Date.now() - startTime;
      logError('Error polling for transaction receipt', {
        ...context,
        txHash,
        attempt: attempts,
        elapsed: `${elapsed}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Continue polling despite errors (RPC might be temporarily unavailable)
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }

  const elapsed = Date.now() - startTime;
  logError('Transaction receipt polling timed out', {
    ...context,
    txHash,
    attempts,
    elapsed: `${elapsed}ms`,
    timeoutMs,
  });

  return null;
}


/**
 * Check if a pledge exists on-chain by polling the s_processedPledges mapping
 * Uses the contract's built-in tracking of processed pledges
 *
 * @param treasuryContract - Treasury contract instance
 * @param pledgeId - Pledge ID to check
 * @param adminAddress - Admin wallet address used in internal pledge ID calculation
 * @param pollIntervalMs - Interval between polls (default 2000ms)
 * @param timeoutMs - Maximum time to poll (default 240000ms = 4 minutes)
 * @param context - Logging context
 * @returns true if pledge exists, false otherwise
 */
export async function pollForPledgeExistence(
  treasuryContract: ethers.Contract,
  pledgeId: string,
  adminAddress: string,
  pollIntervalMs: number = 2000,
  timeoutMs: number = 240000,
  context?: Record<string, unknown>,
): Promise<boolean> {
  const startTime = Date.now();
  let attempts = 0;

  logVerbose('Starting pledge existence polling via s_processedPledges', {
    ...context,
    pledgeId,
    adminAddress,
    pollIntervalMs,
    timeoutMs,
  });

  while (Date.now() - startTime < timeoutMs) {
    attempts++;

    try {
      // Compute the internal pledge ID used by the contract
      const internalPledgeId = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'address'],
          [pledgeId, adminAddress]
        )
      );

      // Call the s_processedPledges getter
      const isProcessed = await treasuryContract.s_processedPledges(internalPledgeId);

      if (isProcessed) {
        const elapsed = Date.now() - startTime;
        logVerbose('Pledge found on-chain via s_processedPledges', {
          ...context,
          pledgeId,
          adminAddress,
          internalPledgeId,
          attempts,
          elapsedMs: elapsed,
        });
        return true;
      }

      // Pledge doesn't exist yet, wait and try again
      logVerbose('Pledge not found, waiting to retry', {
        ...context,
        pledgeId,
        attempts,
        elapsedMs: Date.now() - startTime,
      });

      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      const elapsed = Date.now() - startTime;
      logVerbose('Error polling for pledge existence via s_processedPledges, continuing to poll', {
        ...context,
        pledgeId,
        attempts,
        elapsedMs: elapsed,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Continue polling despite errors
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }

  // Timeout reached without finding pledge
  logVerbose('Pledge existence polling timed out', {
    ...context,
    pledgeId,
    attempts,
    elapsedMs: Date.now() - startTime,
    timeoutMs,
  });

  return false;
}

/**
 * Wait for transaction with fallback polling
 * First tries tx.wait(), then falls back to polling if it times out
 *
 * @param tx - Transaction object with wait() method and hash
 * @param provider - Ethers provider for fallback polling
 * @param operation - Description of operation for logging
 * @param waitTimeoutMs - Timeout for tx.wait() (default 90000ms = 1.5 minutes)
 * @param pollTimeoutMs - Timeout for fallback polling (default 150000ms = 2.5 minutes)
 * @param context - Logging context
 * @returns Transaction receipt
 * @throws Error if transaction fails or cannot be confirmed
 */
export async function waitForTransactionWithPolling(
  tx: { wait: () => Promise<ethers.TransactionReceipt | null>; hash: string },
  provider: ethers.Provider,
  operation: string,
  waitTimeoutMs: number = 90000,
  pollTimeoutMs: number = 150000,
  context?: Record<string, unknown>,
): Promise<ethers.TransactionReceipt> {
  const txContext = { ...context, txHash: tx.hash };

  logVerbose(`Waiting for ${operation}`, {
    ...txContext,
    waitTimeoutMs,
    pollTimeoutMs,
    strategy: 'wait() with polling fallback',
  });

  // First, try normal tx.wait() with timeout
  try {
    const waitPromise = tx.wait();
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('tx.wait() timeout')), waitTimeoutMs),
    );

    const receipt = await Promise.race([waitPromise, timeoutPromise]);

    if (receipt) {
      logVerbose(`${operation} confirmed via tx.wait()`, {
        ...txContext,
        blockNumber: receipt.blockNumber,
        status: receipt.status ? 'SUCCESS' : 'FAILED',
      });

      if (receipt.status !== 1) {
        throw new Error(`Transaction reverted. Hash: ${tx.hash}`);
      }

      return receipt;
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('tx.wait() timeout')) {
      logVerbose(
        `tx.wait() timed out, falling back to polling for ${operation}`,
        {
          ...txContext,
          waitTimeoutMs,
        },
      );
    } else {
      logError(`tx.wait() failed for ${operation}, falling back to polling`, {
        ...txContext,
        error: errorMessage,
      });
    }
  }

  // Fallback: Poll for transaction receipt
  logVerbose(`Polling for ${operation} receipt`, {
    ...txContext,
    pollTimeoutMs,
  });

  const receipt = await pollForTransactionReceipt(
    provider,
    tx.hash,
    2000, // Poll every 2 seconds
    pollTimeoutMs,
    txContext,
  );

  if (!receipt) {
    throw new Error(
      `Transaction not confirmed within timeout. Hash: ${tx.hash}. ` +
        `This might mean RPC is slow. Check transaction status on CeloScan.`,
    );
  }

  if (receipt.status !== 1) {
    throw new Error(`Transaction reverted. Hash: ${tx.hash}`);
  }

  logVerbose(`${operation} confirmed via polling`, {
    ...txContext,
    blockNumber: receipt.blockNumber,
    status: 'SUCCESS',
  });

  return receipt;
}
