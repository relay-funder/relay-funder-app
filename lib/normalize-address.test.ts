import { describe, test, expect } from 'vitest';
import { normalizeAddress } from './normalize-address';

describe('normalizeAddress', () => {
  test('should normalize a lowercase Ethereum address', () => {
    const address = '0x742d35cc6634c0532925a3b844bc454e4438f44e';
    expect(normalizeAddress(address)).toBe(address);
  });

  test('should normalize an uppercase Ethereum address to lowercase', () => {
    const address = '0x742D35CC6634C0532925A3B844BC454E4438F44E';
    const expected = '0x742d35cc6634c0532925a3b844bc454e4438f44e';
    expect(normalizeAddress(address)).toBe(expected);
  });

  test('should normalize a mixed-case Ethereum address to lowercase', () => {
    const address = '0x742d35CC6634c0532925a3b844BC454e4438f44E';
    const expected = '0x742d35cc6634c0532925a3b844bc454e4438f44e';
    expect(normalizeAddress(address)).toBe(expected);
  });

  test('should return null for address without 0x prefix', () => {
    const address = '742d35cc6634c0532925a3b844bc454e4438f44e';
    expect(normalizeAddress(address)).toBe(null);
  });

  test('should return null for null input', () => {
    expect(normalizeAddress(null)).toBe(null);
  });

  test('should return null for undefined input', () => {
    expect(normalizeAddress(undefined)).toBe(null);
  });

  test('should return null for non-string input', () => {
    expect(normalizeAddress(123 as unknown as string)).toBe(null);
    expect(normalizeAddress({} as unknown as string)).toBe(null);
  });

  test('should return null for empty string', () => {
    expect(normalizeAddress('')).toBe(null);
  });
});
