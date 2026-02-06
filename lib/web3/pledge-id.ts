import { keccak256, toBytes } from 'viem';

export interface DeterministicPledgeIdInput {
  treasuryAddress: string;
  userAddress: string;
  paymentId: number;
}

export interface DeterministicPledgeIdCandidates {
  canonicalPledgeId: string;
  legacyPledgeId: string | null;
}

function hashPledgeId(input: {
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

/**
 * Compute a deterministic pledge ID from stable payment fields.
 *
 * The same inputs always produce the same hash, which prevents duplicate
 * on-chain executions after crashes or retries. Addresses are lowercased
 * to guarantee consistent hashes regardless of EIP-55 checksum casing.
 */
export function computeDeterministicPledgeId(
  input: DeterministicPledgeIdInput,
): string {
  return hashPledgeId({
    treasuryAddress: input.treasuryAddress.toLowerCase(),
    userAddress: input.userAddress.toLowerCase(),
    paymentId: input.paymentId,
  });
}

/**
 * Legacy deterministic pledge ID (pre-address-normalization behavior).
 *
 * This is used only for backward-compatible safety checks against older
 * executions where checksum casing could affect the computed hash.
 */
export function computeLegacyDeterministicPledgeId(
  input: DeterministicPledgeIdInput,
): string {
  return hashPledgeId(input);
}

/**
 * Compute canonical + legacy pledge ID candidates for backward-compatible
 * on-chain idempotency checks.
 */
export function computeDeterministicPledgeIdCandidates(
  input: DeterministicPledgeIdInput,
): DeterministicPledgeIdCandidates {
  const canonicalPledgeId = computeDeterministicPledgeId(input);
  const legacyPledgeId = computeLegacyDeterministicPledgeId(input);

  return {
    canonicalPledgeId,
    legacyPledgeId:
      legacyPledgeId === canonicalPledgeId ? null : legacyPledgeId,
  };
}
