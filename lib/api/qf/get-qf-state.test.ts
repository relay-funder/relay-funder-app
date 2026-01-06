import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { getQfRoundState } from './get-qf-state';
import { getRoundForCalculationQuery } from './queries';
import {
  mockedQfRoundMultipleCampaigns,
  mockedQfRoundLargeContributions,
  mockedQfRoundDecimalPool,
  mockedQfRoundEmpty,
  mockedQfRoundZeroMatchingPool,
} from './__mocks__';

// Mock dependencies
vi.mock('./queries', () => ({
  getRoundForCalculationQuery: vi.fn(),
}));

vi.mock('@/lib/debug', () => ({
  debugQf: false,
}));

describe('getQfRoundState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Cases', () => {
    test('should return QfRoundState for valid round with campaigns and matching pool', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundMultipleCampaigns.round,
      );

      const result = await getQfRoundState(1);

      expect(result).toEqual(mockedQfRoundMultipleCampaigns.state);

      expect(getRoundForCalculationQuery).toHaveBeenCalledWith(1);
    });

    test('should handle round with large matching pool', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundLargeContributions.round,
      );

      const result = await getQfRoundState(1);

      expect(result).toEqual(mockedQfRoundLargeContributions.state!);

      expect(getRoundForCalculationQuery).toHaveBeenCalledWith(1);
    });

    test('should handle round with fractional matching pool', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundDecimalPool.round,
      );

      const result = await getQfRoundState(1);

      expect(result).toEqual(mockedQfRoundDecimalPool.state!);

      expect(getRoundForCalculationQuery).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Cases', () => {
    test('should throw ApiNotFoundError when round does not exist', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(null);

      await expect(getQfRoundState(999)).rejects.toThrow(ApiNotFoundError);
      await expect(getQfRoundState(999)).rejects.toThrow(
        'Round with id 999 does not exist',
      );
    });
    test('should throw ApiParameterError when round has no campaigns', async () => {
      const { getRoundForCalculationQuery } = await import('./queries');
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundEmpty.round,
      );

      await expect(getQfRoundState(1)).rejects.toThrow(ApiParameterError);
      await expect(getQfRoundState(1)).rejects.toThrow(
        'Round with id 1 has no campaigns',
      );
    });

    test('should throw ApiParameterError when round has zero matching pool', async () => {
      const { getRoundForCalculationQuery } = await import('./queries');
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundZeroMatchingPool.round,
      );

      await expect(getQfRoundState(1)).rejects.toThrow(ApiParameterError);
      await expect(getQfRoundState(1)).rejects.toThrow(
        'Round with id 1 has no matching pool',
      );
    });
  });

  describe('Integration with Dependencies', () => {
    test('should handle database query errors', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(getRoundForCalculationQuery).mockRejectedValue(dbError);

      await expect(getQfRoundState(1)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
