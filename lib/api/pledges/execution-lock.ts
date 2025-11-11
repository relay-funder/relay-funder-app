import { db } from '@/server/db';
import { logFactory } from '@/lib/debug';

const logVerbose = logFactory('verbose', '🔒 ExecutionLock');
const logError = logFactory('error', '🚨 ExecutionLock');

/**
 * PostgreSQL Advisory Lock System for Gateway Pledge Execution
 * 
 * Uses PostgreSQL's advisory locks to ensure exactly-once execution semantics
 * for gateway pledge processing. Advisory locks are:
 * - Automatically released when the connection closes (crash recovery)
 * - Session-level locks (released when transaction commits/rolls back)
 * - Non-blocking with pg_try_advisory_lock (fail fast if already held)
 * 
 * Lock Namespace:
 * - We use payment.id as the lock ID (unique integer)
 * - Lock class: 1000 (arbitrary namespace for pledge execution locks)
 * - Full lock key: (1000, payment.id)
 */

const LOCK_CLASS_ID = 1000; // Namespace for pledge execution locks

/**
 * Attempt to acquire an advisory lock for payment execution.
 * 
 * This is a non-blocking operation that will immediately return false
 * if another process holds the lock.
 * 
 * @param paymentId - The payment ID to lock
 * @returns true if lock acquired, false if already held by another session
 * @throws Error if database query fails
 */
export async function acquireExecutionLock(
  paymentId: number,
): Promise<boolean> {
  try {
    logVerbose('Attempting to acquire execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
    });

    // Use pg_try_advisory_lock with two integers (lock class, payment ID)
    // This is non-blocking - returns true if acquired, false if already held
    const result = await db.$queryRaw<Array<{ acquired: boolean }>>`
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
 * Release an advisory lock for payment execution.
 * 
 * Should be called in a finally block to ensure lock is always released.
 * Safe to call even if lock wasn't acquired (returns false but doesn't error).
 * 
 * @param paymentId - The payment ID to unlock
 * @returns true if lock was held and released, false if lock wasn't held
 * @throws Error if database query fails
 */
export async function releaseExecutionLock(
  paymentId: number,
): Promise<boolean> {
  try {
    logVerbose('Attempting to release execution lock', {
      paymentId,
      lockClassId: LOCK_CLASS_ID,
    });

    // Use pg_advisory_unlock with two integers (lock class, payment ID)
    // Returns true if lock was held and released, false if lock wasn't held
    const result = await db.$queryRaw<Array<{ released: boolean }>>`
      SELECT pg_advisory_unlock(${LOCK_CLASS_ID}, ${paymentId}) as released
    `;

    const released = result[0]?.released ?? false;

    if (released) {
      logVerbose('Execution lock released successfully', {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
      });
    } else {
      logVerbose('Execution lock was not held by this session', {
        paymentId,
        lockClassId: LOCK_CLASS_ID,
      });
    }

    return released;
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
    // Try to acquire the lock
    const acquired = await acquireExecutionLock(paymentId);

    if (acquired) {
      // We acquired it, so it wasn't held. Release it immediately.
      await releaseExecutionLock(paymentId);
      return false;
    } else {
      // Could not acquire, so it's held by another session
      return true;
    }
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
 * This is a convenience wrapper that:
 * 1. Attempts to acquire the lock
 * 2. Throws if lock cannot be acquired
 * 3. Executes the provided function
 * 4. Releases the lock in a finally block (always executed)
 * 
 * @param paymentId - The payment ID to lock
 * @param fn - The function to execute while holding the lock
 * @returns The result of the function
 * @throws Error if lock cannot be acquired or if fn throws
 */
export async function withExecutionLock<T>(
  paymentId: number,
  fn: () => Promise<T>,
): Promise<T> {
  const acquired = await acquireExecutionLock(paymentId);

  if (!acquired) {
    throw new Error(
      `Cannot execute: payment ${paymentId} is already being processed by another session`,
    );
  }

  try {
    return await fn();
  } finally {
    await releaseExecutionLock(paymentId);
  }
}

