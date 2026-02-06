import { keccak256, toBytes } from 'viem';

/**
 * Compute a deterministic pledge ID from stable payment fields.
 *
 * The same inputs always produce the same hash, which prevents duplicate
 * on-chain executions after crashes or retries.
 */
export function computeDeterministicPledgeId(input: {
  treasuryAddress: string;
  userAddress: string;
  paymentId: number;
}): string {
  return keccak256(
    toBytes(
      `pledge-${input.treasuryAddress}-${input.userAddress}-${input.paymentId}`,
    ),
  );
}
