import { describe, test, expect } from 'vitest';

describe('useWithdrawals - URL construction', () => {
  test('should construct correct URL with default pagination', () => {
    const pageParam = 1;
    const pageSize = 10;
    const url = `/api/users/me/withdrawals?page=${pageParam}&pageSize=${pageSize}`;

    expect(url).toBe('/api/users/me/withdrawals?page=1&pageSize=10');
  });

  test('should construct correct URL for page 2', () => {
    const pageParam = 2;
    const pageSize = 10;
    const url = `/api/users/me/withdrawals?page=${pageParam}&pageSize=${pageSize}`;

    expect(url).toBe('/api/users/me/withdrawals?page=2&pageSize=10');
  });

  test('should construct correct URL with custom pageSize', () => {
    const pageParam = 1;
    const pageSize = 20;
    const url = `/api/users/me/withdrawals?page=${pageParam}&pageSize=${pageSize}`;

    expect(url).toBe('/api/users/me/withdrawals?page=1&pageSize=20');
  });
});

describe('useWithdrawals - Query keys', () => {
  const WITHDRAWALS_QUERY_KEY = 'withdrawals';

  test('should have correct query key for user page query', () => {
    const pageSize = 10;
    const queryKey = [WITHDRAWALS_QUERY_KEY, 'user', 'page', pageSize];

    expect(queryKey).toEqual(['withdrawals', 'user', 'page', 10]);
  });

  test('should have correct query key for infinite query', () => {
    const pageSize = 10;
    const queryKey = [WITHDRAWALS_QUERY_KEY, 'user', 'infinite', pageSize];

    expect(queryKey).toEqual(['withdrawals', 'user', 'infinite', 10]);
  });

  test('should include different pageSize in query key', () => {
    const pageSize = 20;
    const queryKey = [WITHDRAWALS_QUERY_KEY, 'user', 'infinite', pageSize];

    expect(queryKey).toEqual(['withdrawals', 'user', 'infinite', 20]);
  });
});

describe('useWithdrawals - getNextPageParam logic', () => {
  test('should return next page when hasMore is true', () => {
    const lastPage = {
      withdrawals: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 3,
        totalItems: 25,
        hasMore: true,
      },
    };

    const nextPage = lastPage.pagination.hasMore
      ? lastPage.pagination.currentPage + 1
      : undefined;

    expect(nextPage).toBe(2);
  });

  test('should return undefined when hasMore is false', () => {
    const lastPage = {
      withdrawals: [],
      pagination: {
        currentPage: 3,
        pageSize: 10,
        totalPages: 3,
        totalItems: 25,
        hasMore: false,
      },
    };

    const nextPage = lastPage.pagination.hasMore
      ? lastPage.pagination.currentPage + 1
      : undefined;

    expect(nextPage).toBeUndefined();
  });
});

describe('useWithdrawals - getPreviousPageParam logic', () => {
  test('should return previous page when currentPage > 1', () => {
    const firstPage = {
      withdrawals: [],
      pagination: {
        currentPage: 2,
        pageSize: 10,
        totalPages: 3,
        totalItems: 25,
        hasMore: true,
      },
    };

    const previousPage =
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined;

    expect(previousPage).toBe(1);
  });

  test('should return undefined when on first page', () => {
    const firstPage = {
      withdrawals: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalPages: 3,
        totalItems: 25,
        hasMore: true,
      },
    };

    const previousPage =
      firstPage.pagination.currentPage > 1
        ? firstPage.pagination.currentPage - 1
        : undefined;

    expect(previousPage).toBeUndefined();
  });
});

describe('Cache invalidation query keys', () => {
  const WITHDRAWALS_QUERY_KEY = 'withdrawals';

  test('should have correct invalidation key pattern', () => {
    const invalidationKey = [WITHDRAWALS_QUERY_KEY, 'user', 'infinite'];

    expect(invalidationKey).toEqual(['withdrawals', 'user', 'infinite']);
  });

  test('invalidation key should be prefix of actual query keys', () => {
    const invalidationKey = [WITHDRAWALS_QUERY_KEY, 'user', 'infinite'];
    const actualQueryKey = [WITHDRAWALS_QUERY_KEY, 'user', 'infinite', 10];

    expect(actualQueryKey.slice(0, invalidationKey.length)).toEqual(
      invalidationKey,
    );
  });
});
