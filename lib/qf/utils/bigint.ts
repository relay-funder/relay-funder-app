/**
 * Integer square root function for bigint values.
 *
 * Adapted from the bigint-isqrt implementation by Aisse-258:
 * https://github.com/Aisse-258/bigint-isqrt
 *
 * This implementation uses an optimized Newton-Raphson method with heuristics
 * for fast convergence on large bigint inputs.
 *
 * Modifications include:
 * - Improved initial guess based on decimal length
 * - Additional input checks and comments for clarity
 *
 * Original code licensed under the MIT License:
 * https://github.com/Aisse-258/bigint-isqrt/blob/master/LICENSE
 *
 * @param {bigint} value - The bigint value to compute the integer square root of (must be ≥ 0n).
 * @returns {bigint} - The largest bigint x such that x * x ≤ value.
 * @throws {Error} If a negative value is passed.
 */
export function sqrtBigInt(value: bigint): bigint {
  if (value < 0n) {
    throw new Error('Square root of negative numbers is not supported');
  }

  // For very small values, return value immediately (0 or 1)
  if (value < 2n) {
    return value;
  }

  // For values less than 16, use the native Math.sqrt for speed (safe for these small inputs)
  if (value < 16n) {
    return BigInt(Math.floor(Math.sqrt(Number(value))));
  }

  let x0: bigint;
  let x1: bigint;

  // For numbers smaller than 2^52, use Math.sqrt-based initial guess minus a small offset
  if (value < 4503599627370496n) {
    // 1 << 52
    x1 = BigInt(Math.floor(Math.sqrt(Number(value)))) - 3n;
  } else {
    // For large numbers, use the decimal length heuristic for initial guess:
    // roughly 10^(length/2) or 4 * 10^(floor(length/2))
    const decimalLength = value.toString().length;
    if (decimalLength % 2 === 0) {
      x1 = 10n ** BigInt(decimalLength / 2);
    } else {
      x1 = 4n * 10n ** BigInt(Math.floor(decimalLength / 2));
    }
  }

  do {
    x0 = x1;
    // Newton iteration: x1 = (x0 + value / x0) / 2
    x1 = (x0 + value / x0) >> 1n;
    // Repeat until convergence: x0 == x1 or x0 + 1 == x1 (stable integer result)
  } while (x0 !== x1 && x0 !== x1 - 1n);

  return x0;
}
