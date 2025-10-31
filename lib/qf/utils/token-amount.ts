/**
 * Why this exists
 * - Standardizes how we round down token amounts (bigint, smallest units) to a desired visible/settlement precision.
 * - Prevents accidental over-allocation of matching pools by always truncating (never rounding up).
 * - Ensures deterministic, token-decimal–aware math across Qf distribution, simulation, and payouts.
 *
 * When to use
 * - After computing provisional allocations, before persisting/sending on-chain, or before producing user-visible “settled” figures.
 * - Any time we need “whole tokens” or “cents-like” decimals from a higher-precision on-chain token (e.g., USDC 6 decimals → 0 or 2).
 *
 * Behavior
 * - Operates on smallest units (bigint) and respects token decimals.
 * - If `precisionDecimals >= tokenDecimals`, no change is applied.
 * - Always rounds DOWN via integer division to avoid exceeding the pool.
 *
 * Non-goals
 * - Does not distribute “dust” created by truncation; caller decides how to handle remaining dust.
 * - Not a display formatter; use `formatUnits` for string output.
 *
 * Notes
 * - Centralizes logic to avoid drift vs ad-hoc helpers (e.g., duplicate `roundToPrecision`).
 * - Prefer using this util wherever precision truncation is needed.
 * - If `precisionDecimals >= tokenDecimals`, no rounding is applied.
 * - Rounding is always DOWN via integer division, to avoid over‑allocating.
 *
 * @param amount - Amount in smallest token units - wei (bigint).
 * @param tokenDecimals - Number of decimals for the token (e.g., 6 for USDC).
 * @param precisionDecimals - Desired number of decimals to preserve.
 * @returns Rounded down bigint in smallest token units.
 */
export function truncateToTokenPrecision({
  amount,
  tokenDecimals,
  precisionDecimals,
}: {
  amount: bigint;
  tokenDecimals: number;
  precisionDecimals?: number;
}): bigint {
  if (
    precisionDecimals === undefined ||
    precisionDecimals < 0 ||
    precisionDecimals >= tokenDecimals
  )
    return amount;

  const factor = 10n ** BigInt(tokenDecimals - precisionDecimals);
  return (amount / factor) * factor;
}
