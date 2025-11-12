import { db } from '@/server/db';
import { logFactory } from '@/lib/debug';
import { Prisma } from '@/.generated/prisma/client';
import { TIMEOUT_VALUES } from '@/lib/web3/transaction-timeout';

const logVerbose = logFactory('verbose', '🔒 ExecutionLock');
const logError = logFactory('error', '🚨 ExecutionLock');

/**
 * PostgreSQL Advisory Lock System for Gateway Pledge Execution
 *
 * Uses PostgreSQL's advisory locks to ensure exactly-once execution semantics
 * for gateway pledge processing. Advisory locks are:
 * - Automatically released when the connection closes (crash recovery)
 * - Session-level locks (connection-scoped, NOT transaction-scoped)
 * - Non-blocking with pg_try_advisory_lock (fail fast if already held)
 *
 * All lock operations (acquire/release) MUST run on the same DB connection.
 * We use Prisma interactive transactions to guarantee this.
 *
 * Lock Namespace:
 * - We use payment.id as the lock ID (unique integer)
 * - Lock class: 1000 (arbitrary namespace for pledge execution locks)
 * - Full lock key: (1000, payment.id)
 */

const LOCK_CLASS_ID = 1000; // Namespace for pledge execution locks

type TransactionClient = Omit<
  typeof db,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Attempt to acquire a TRANSACTION-LEVEL advisory lock for payment execution.
 *
 * Transaction-level locks are automatically released when the transaction commits or rolls back,
 * preventing the race condition where lock was released before transaction commit.
 *
 * This is a non-blocking operation that will immediately return false
 * if another process holds the lock.
 *
 * IMPORTANT: This function MUST be called within a transaction context.
 *
 * @param tx - Prisma transaction client
 * @param paymentId - The payment ID to lock
 * @returns true if lock acquired, false if already held by another session
 * @throws Error if database query fails
 */
async function acquireExecutionLockOnTransaction(
  tx: TransactionClient,
  paymentId: number,
): Promise<boolean> {
  try {
    logVerbose('Attempting to acquire transaction-level execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
      lockType: 'pg_try_advisory_xact_lock',
    });

    // Use pg_try_advisory_xact_lock with two integers (lock class, payment ID)
    // This is TRANSACTION-LEVEL - automatically released at transaction end
    // This prevents race condition where lock was released before transaction commit
    // Cast to int (32-bit) explicitly, as PostgreSQL doesn't support (bigint, bigint) signature
    const result = await tx.$queryRaw<Array<{ acquired: boolean }>>`
      SELECT pg_try_advisory_xact_lock(${LOCK_CLASS_ID}::int, ${paymentId}::int) as acquired
    `;

    const acquired = result[0]?.acquired ?? false;

    if (acquired) {
      logVerbose('Transaction-level execution lock acquired successfully', {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
        note: 'Lock will auto-release when transaction commits or rolls back',
      });
    } else {
      logVerbose('Execution lock already held by another transaction', {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
      });
    }

    return acquired;
  } catch (error) {
    logError('Failed to acquire execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * NOTE: Transaction-level advisory locks (pg_advisory_xact_lock) are automatically
 * released when the transaction commits or rolls back, so no explicit release is needed.
 *
 * This function is kept for compatibility with isExecutionLockHeld() which uses
 * session-level locks for testing purposes.
 *
 * @deprecated No longer needed with transaction-level locks
 */
async function releaseExecutionLockOnTransaction(
  tx: TransactionClient,
  paymentId: number,
): Promise<void> {
  // Transaction-level locks auto-release - no action needed
  logVerbose('Transaction-level lock will auto-release at transaction end', {
    paymentId,
    lockClassId: LOCK_CLASS_ID,
    note: 'No explicit release needed for pg_advisory_xact_lock',
  });
}

/**
 * Check if a payment execution lock is currently held by any session.
 *
 * This is useful for detecting stuck executions or checking eligibility
 * for retry operations.
 *
 * Note: This is a point-in-time check. The lock status may change
 * immediately after this function returns.
 *
 * @param paymentId - The payment ID to check
 * @returns true if lock is currently held, false otherwise
 */
export async function isExecutionLockHeld(paymentId: number): Promise<boolean> {
  try {
    // Use a transaction to ensure acquire/release happen on the same connection
    return await db.$transaction(async (tx) => {
      // Try to acquire the lock
      const acquired = await acquireExecutionLockOnTransaction(tx, paymentId);

      if (acquired) {
        // We acquired it, so it wasn't held. Release it immediately.
        await releaseExecutionLockOnTransaction(tx, paymentId);
        return false;
      } else {
        // Could not acquire, so it's held by another session
        return true;
      }
    });
  } catch (error) {
    logError('Failed to check execution lock status', {
      paymentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Execute a function with a TRANSACTION-LEVEL advisory lock held.
 *
 * Uses transaction-level locks (pg_advisory_xact_lock) which are
 * automatically released when the transaction commits or rolls back. This eliminates
 * the race condition where the lock was released before transaction commit.
 *
 * This wrapper ensures that:
 * 1. The lock is acquired on a dedicated database connection
 * 2. The callback function executes on the SAME connection
 * 3. The lock is automatically released when transaction ends (commit or rollback)
 * 4. All operations are properly isolated within a transaction
 *
 * The callback receives a Prisma transaction client (tx) that MUST be used
 * for all database operations to ensure they run on the locked connection.
 *
 * @param paymentId - The payment ID to lock
 * @param fn - The function to execute while holding the lock (receives tx client)
 * @returns The result of the function
 * @throws Error if lock cannot be acquired or if fn throws
 */
export async function withExecutionLock<T>(
  paymentId: number,
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return await db.$transaction(
    async (tx) => {
      // Acquire transaction-level lock
      const acquired = await acquireExecutionLockOnTransaction(tx, paymentId);

      if (!acquired) {
        throw new Error(
          `Cannot execute: payment ${paymentId} is already being processed by another transaction`,
        );
      }

      // Execute callback with the same transaction client
      // Lock will automatically release when transaction commits or rolls back
      return await fn(tx);
    },
    {
      maxWait: 5000, // Maximum time to wait for a connection (5 seconds)
      timeout: TIMEOUT_VALUES.OVERALL_EXECUTION, // Match overall execution timeout (240 seconds)
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
}
