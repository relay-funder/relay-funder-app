import { describe, expect, test } from 'vitest';
import {
  computeDeterministicPledgeId,
  computeDeterministicPledgeIdCandidates,
  computeLegacyDeterministicPledgeId,
} from './pledge-id';

describe('computeDeterministicPledgeId', () => {
  test('produces the same canonical hash for checksum and lowercase addresses', () => {
    const checksumInput = {
      treasuryAddress: '0xAbCdEf0000000000000000000000000000001234',
      userAddress: '0x123450000000000000000000000000000000AbCd',
      paymentId: 42,
    };
    const lowercaseInput = {
      treasuryAddress: checksumInput.treasuryAddress.toLowerCase(),
      userAddress: checksumInput.userAddress.toLowerCase(),
      paymentId: checksumInput.paymentId,
    };

    expect(computeDeterministicPledgeId(checksumInput)).toBe(
      computeDeterministicPledgeId(lowercaseInput),
    );
  });

  test('keeps legacy hash available when casing changes the result', () => {
    const input = {
      treasuryAddress: '0xAbCdEf0000000000000000000000000000001234',
      userAddress: '0x123450000000000000000000000000000000AbCd',
      paymentId: 7,
    };

    expect(computeLegacyDeterministicPledgeId(input)).not.toBe(
      computeDeterministicPledgeId(input),
    );
  });
});

describe('computeDeterministicPledgeIdCandidates', () => {
  test('omits legacy candidate when canonical and legacy hashes match', () => {
    const input = {
      treasuryAddress: '0xabcdef0000000000000000000000000000001234',
      userAddress: '0x123450000000000000000000000000000000abcd',
      paymentId: 1,
    };

    expect(computeDeterministicPledgeIdCandidates(input)).toEqual({
      canonicalPledgeId: computeDeterministicPledgeId(input),
      legacyPledgeId: null,
    });
  });

  test('includes a legacy candidate for backward-compatible checks when hashes differ', () => {
    const input = {
      treasuryAddress: '0xAbCdEf0000000000000000000000000000001234',
      userAddress: '0x123450000000000000000000000000000000AbCd',
      paymentId: 99,
    };
    const candidates = computeDeterministicPledgeIdCandidates(input);

    expect(candidates.canonicalPledgeId).toBe(computeDeterministicPledgeId(input));
    expect(candidates.legacyPledgeId).toBe(
      computeLegacyDeterministicPledgeId(input),
    );
  });
});
