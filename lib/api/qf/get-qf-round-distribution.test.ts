import { describe, test, expect, vi } from 'vitest';
import { ApiNotFoundError, ApiParameterError } from '@/lib/api/error';
import { getRoundQfDistribution } from './get-qf-round-distribution';
import {
  mockedQfRoundEmpty,
  mockedQfRoundMultipleCampaigns,
  mockedQfRoundZeroMatchingPool,
} from './__mocks__';
import { getRoundForCalculationQuery } from './queries';

vi.mock('./queries', () => ({
  getRoundForCalculationQuery: vi.fn(),
}));

vi.mock('@/lib/debug', () => ({
  debugQf: false,
}));

describe('getRoundQfDistribution', () => {
  describe('Successful Cases', () => {
    test('should successfully calculate QF distribution', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundMultipleCampaigns.round,
      );

      const result = await getRoundQfDistribution(1);

      expect(result).toEqual(mockedQfRoundMultipleCampaigns.distribution!);
      expect(getRoundForCalculationQuery).toHaveBeenCalledWith(1);
    });
  });
  describe('Error Cases', () => {
    test('should throw ApiNotFoundError when round does not exist', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(null);

      await expect(getRoundQfDistribution(999)).rejects.toThrow(
        ApiNotFoundError,
      );
      await expect(getRoundQfDistribution(999)).rejects.toThrow(
        'Round with id 999 does not exist',
      );
    });
    test('should throw ApiParameterError when round has no campaigns', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundEmpty.round,
      );

      await expect(getRoundQfDistribution(1)).rejects.toThrow(
        ApiParameterError,
      );
      await expect(getRoundQfDistribution(1)).rejects.toThrow(
        'Round with id 1 has no campaigns',
      );
    });
    test('should throw ApiParameterError when round has no matching pool', async () => {
      vi.mocked(getRoundForCalculationQuery).mockResolvedValue(
        mockedQfRoundZeroMatchingPool.round,
      );

      await expect(getRoundQfDistribution(1)).rejects.toThrow(
        ApiParameterError,
      );
      await expect(getRoundQfDistribution(1)).rejects.toThrow(
        'Round with id 1 has no matching pool',
      );
    });
  });
});
