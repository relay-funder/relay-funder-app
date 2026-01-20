import { describe, test, expect } from 'vitest';
import type { UserWithdrawal, PaginatedUserWithdrawalsResponse } from './index';

describe('UserWithdrawal type structure', () => {
  test('should accept valid UserWithdrawal object', () => {
    const validWithdrawal: UserWithdrawal = {
      id: 1,
      amount: '100.00',
      token: 'USDC',
      requestType: 'WITHDRAWAL_AMOUNT',
      transactionHash: '0x1234567890abcdef',
      createdAt: '2025-01-15T00:00:00.000Z',
      approvedById: 1,
      campaign: {
        id: 1,
        title: 'Test Campaign',
        slug: 'test-campaign',
      },
      approvedBy: {
        id: 1,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
      },
    };

    expect(validWithdrawal.id).toBe(1);
    expect(validWithdrawal.amount).toBe('100.00');
    expect(validWithdrawal.token).toBe('USDC');
    expect(validWithdrawal.requestType).toBe('WITHDRAWAL_AMOUNT');
    expect(validWithdrawal.transactionHash).toBe('0x1234567890abcdef');
  });

  test('should accept UserWithdrawal with null transactionHash', () => {
    const pendingWithdrawal: UserWithdrawal = {
      id: 2,
      amount: '50.00',
      token: 'USDC',
      requestType: 'WITHDRAWAL_AMOUNT',
      transactionHash: null,
      createdAt: '2025-01-16T00:00:00.000Z',
      approvedById: null,
      campaign: {
        id: 2,
        title: 'Another Campaign',
        slug: 'another-campaign',
      },
      approvedBy: null,
    };

    expect(pendingWithdrawal.transactionHash).toBeNull();
    expect(pendingWithdrawal.approvedById).toBeNull();
    expect(pendingWithdrawal.approvedBy).toBeNull();
  });

  test('should accept UserWithdrawal with approvedBy but no transactionHash (processing)', () => {
    const processingWithdrawal: UserWithdrawal = {
      id: 3,
      amount: '75.00',
      token: 'USDC',
      requestType: 'WITHDRAWAL_AMOUNT',
      transactionHash: null,
      createdAt: '2025-01-17T00:00:00.000Z',
      approvedById: 1,
      campaign: {
        id: 1,
        title: 'Test Campaign',
        slug: 'test-campaign',
      },
      approvedBy: {
        id: 1,
        username: null,
        firstName: 'Admin',
        lastName: null,
      },
    };

    expect(processingWithdrawal.approvedById).toBe(1);
    expect(processingWithdrawal.transactionHash).toBeNull();
    expect(processingWithdrawal.approvedBy?.username).toBeNull();
    expect(processingWithdrawal.approvedBy?.lastName).toBeNull();
  });
});

describe('PaginatedUserWithdrawalsResponse type structure', () => {
  test('should accept valid paginated response', () => {
    const response: PaginatedUserWithdrawalsResponse = {
      withdrawals: [
        {
          id: 1,
          amount: '100.00',
          token: 'USDC',
          requestType: 'WITHDRAWAL_AMOUNT',
          transactionHash: '0x1234',
          createdAt: '2025-01-15T00:00:00.000Z',
          approvedById: 1,
          campaign: { id: 1, title: 'Test', slug: 'test' },
          approvedBy: {
            id: 1,
            username: 'admin',
            firstName: 'A',
            lastName: 'B',
          },
        },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        totalItems: 1,
        hasMore: false,
      },
    };

    expect(response.withdrawals).toHaveLength(1);
    expect(response.pagination.currentPage).toBe(1);
    expect(response.pagination.hasMore).toBe(false);
  });

  test('should accept empty withdrawals array', () => {
    const emptyResponse: PaginatedUserWithdrawalsResponse = {
      withdrawals: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0,
        hasMore: false,
      },
    };

    expect(emptyResponse.withdrawals).toHaveLength(0);
    expect(emptyResponse.pagination.totalItems).toBe(0);
  });

  test('should accept paginated response with hasMore true', () => {
    const response: PaginatedUserWithdrawalsResponse = {
      withdrawals: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 5,
        totalItems: 45,
        hasMore: true,
      },
    };

    expect(response.pagination.hasMore).toBe(true);
    expect(response.pagination.totalPages).toBe(5);
  });
});

describe('requestType values', () => {
  test('should accept WITHDRAWAL_AMOUNT requestType', () => {
    const withdrawal: Pick<UserWithdrawal, 'requestType'> = {
      requestType: 'WITHDRAWAL_AMOUNT',
    };
    expect(withdrawal.requestType).toBe('WITHDRAWAL_AMOUNT');
  });

  test('should accept ON_CHAIN_AUTHORIZATION requestType', () => {
    const withdrawal: Pick<UserWithdrawal, 'requestType'> = {
      requestType: 'ON_CHAIN_AUTHORIZATION',
    };
    expect(withdrawal.requestType).toBe('ON_CHAIN_AUTHORIZATION');
  });
});
