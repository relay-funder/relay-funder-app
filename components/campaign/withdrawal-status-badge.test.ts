import { describe, test, expect } from 'vitest';
import { getWithdrawalStatus, type WithdrawalStatus } from './withdrawal-status-badge';

describe('getWithdrawalStatus', () => {
  test('should return "executed" when transactionHash is present', () => {
    const withdrawal = {
      approvedById: 1,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('executed');
  });

  test('should return "executed" when transactionHash is present even without approvedById', () => {
    const withdrawal = {
      approvedById: null,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('executed');
  });

  test('should return "approved" when approvedById is present but no transactionHash', () => {
    const withdrawal = {
      approvedById: 1,
      transactionHash: null,
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('approved');
  });

  test('should return "pending" when neither approvedById nor transactionHash is present', () => {
    const withdrawal = {
      approvedById: null,
      transactionHash: null,
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('pending');
  });

  test('should prioritize transactionHash over approvedById', () => {
    const withdrawal = {
      approvedById: 5,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('executed');
  });

  test('should handle approvedById as 0 (falsy but valid)', () => {
    const withdrawal = {
      approvedById: 0,
      transactionHash: null,
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('pending');
  });

  test('should handle empty string transactionHash as falsy', () => {
    const withdrawal = {
      approvedById: 1,
      transactionHash: '',
    };
    expect(getWithdrawalStatus(withdrawal)).toBe('approved');
  });
});

describe('WithdrawalStatus type', () => {
  test('should have correct possible values', () => {
    const statuses: WithdrawalStatus[] = ['pending', 'approved', 'executed'];
    expect(statuses).toContain('pending');
    expect(statuses).toContain('approved');
    expect(statuses).toContain('executed');
    expect(statuses).toHaveLength(3);
  });
});
