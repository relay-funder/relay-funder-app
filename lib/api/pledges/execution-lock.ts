import { db } from '@/server/db';
import { logFactory } from '@/lib/debug';
import { Prisma } from '@/.generated/prisma/client';

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
 * Attempt to acquire an advisory lock for payment execution on a specific transaction.
 * 
 * This is a non-blocking operation that will immediately return false
 * if another process holds the lock.
 * 
 * IMPORTANT: This function MUST be called within a transaction context
 * to ensure the lock is held on the same connection that will execute
 * the protected operations.
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
    logVerbose('Attempting to acquire execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
    });

    // Use pg_try_advisory_lock with two integers (lock class, payment ID)
    // This is non-blocking - returns true if acquired, false if already held
    const result = await tx.$queryRaw<Array<{ acquired: boolean }>>`
      SELECT pg_try_advisory_lock(${LOCK_CLASS_ID}, ${paymentId}) as acquired
    `;

    const acquired = result[0]?.acquired ?? false;

    if (acquired) {
      logVerbose('Execution lock acquired successfully', {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
      });
    } else {
      logVerbose('Execution lock already held by another session', {
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
 * Release an advisory lock for payment execution on a specific transaction.
 * 
 * Should be called in a finally block to ensure lock is always released.
 * 
 * IMPORTANT: This function MUST be called on the SAME transaction context
 * that acquired the lock. Calling it on a different connection will fail
 * because advisory locks are session-scoped.
 * 
 * @param tx - Prisma transaction client (MUST be the same one that acquired the lock)
 * @param paymentId - The payment ID to unlock
 * @throws Error if lock wasn't held by this session or if database query fails
 */
async function releaseExecutionLockOnTransaction(
  tx: TransactionClient,
  paymentId: number,
): Promise<void> {
  try {
    logVerbose('Attempting to release execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
    });

    // Use pg_advisory_unlock with two integers (lock class, payment ID)
    // Returns true if lock was held and released, false if lock wasn't held
    const result = await tx.$queryRaw<Array<{ released: boolean }>>`
      SELECT pg_advisory_unlock(${LOCK_CLASS_ID}, ${paymentId}) as released
    `;

    const released = result[0]?.released ?? false;

    if (released) {
      logVerbose('Execution lock released successfully', {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
      });
    } else {
      // This is a critical error - we should have held the lock on this session
      const errorMsg = `Lock was not held by this session during release (payment ${paymentId})`;
      logError(errorMsg, {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
      });
      throw new Error(errorMsg);
    }
  } catch (error) {
    logError('Failed to release execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
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
export async function isExecutionLockHeld(
  paymentId: number,
): Promise<boolean> {
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
 * Execute a function with an advisory lock held.
 * 
 * This wrapper ensures that:
 * 1. The lock is acquired on a dedicated database connection
 * 2. The callback function executes on the SAME connection
 * 3. The lock is released on that same connection in a finally block
 * 4. All operations are properly isolated within a transaction
 * 
 * The callback receives a Prisma transaction client (tx) that MUST be used
 * for all database operations to ensure they run on the locked connection.
 * 
 * @param paymentId - The payment ID to lock
 * @param fn - The function to execute while holding the lock (receives tx client)
 * @returns The result of the function
 * @throws Error if lock cannot be acquired, if lock release fails, or if fn throws
 */
export async function withExecutionLock<T>(
  paymentId: number,
  fn: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return await db.$transaction(
    async (tx) => {
      // Acquire lock on this transaction's connection
      const acquired = await acquireExecutionLockOnTransaction(tx, paymentId);

      if (!acquired) {
        throw new Error(
          `Cannot execute: payment ${paymentId} is already being processed by another session`,
        );
      }

      try {
        // Execute callback with the same transaction client
        return await fn(tx);
      } finally {
        // Always release lock on the same connection, even if fn throws
        // If release fails (released === false), this will throw
        await releaseExecutionLockOnTransaction(tx, paymentId);
      }
    },
    {
      maxWait: 5000, // Maximum time to wait for a connection (5 seconds)
      timeout: 30000, // Maximum time for the entire transaction (30 seconds)
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
}

