import { sqrtBigInt } from './bigint';

/**
 * Calculates the quadratic funding score of a campaign from per‑user totals.
 *
 * Definition:
 *   score = (Σ sqrt(user_total_amount))^2
 *
 * Notes:
 * - Input must include each unique donor once with their total contributed amount.
 * - All arithmetic is bigint in the smallest token unit (e.g., 10^-6 for USDC).
 * - Because integer sqrt is used, non‑perfect squares are floored before summation.
 *
 * @param amounts - Array of per‑user total contribution amounts (smallest unit, bigint).
 * @returns The campaign’s QF score as a bigint (squared smallest units).
 */
export function calculateQfScore(amounts: bigint[]): bigint {
  let sumSqrt = 0n;

  for (const amount of amounts) {
    sumSqrt += sqrtBigInt(amount);
  }

  return sumSqrt * sumSqrt;
}
