import { describe, test, expect, vi } from 'vitest';
import { calculateQfDistribution } from './calculate-qf-distribution';
import {
  mockedQfRoundDecimalPool,
  mockedQfRoundLargeContributions,
  mockedQfRoundMixedStatus,
  mockedQfRoundMultipleCampaigns,
  mockedQfRoundNoPayments,
  mockedQfRoundSingleCampaign,
  mockedQfRoundSmallContributions,
} from '@/lib/api/qf/__mocks__';

vi.mock('@/lib/debug', () => ({
  debugQf: false,
}));

// Not testing rounds with no campaigns or no matching pool
// These are tested in the api tests
// parseRoundForQf tests throws the errors

describe('calculateQfDistribution', () => {
  describe('Single Campaign Scenarios', () => {
    test('should allocate entire matching pool to single campaign with contributions', () => {
      const result = calculateQfDistribution(
        mockedQfRoundSingleCampaign.state!,
      );
      expect(result).toEqual(mockedQfRoundSingleCampaign.distribution);
    });

    test('should return zero allocation for single campaign with no contributions', () => {
      const result = calculateQfDistribution(mockedQfRoundNoPayments.state!);
      expect(result).toEqual(mockedQfRoundNoPayments.distribution);
    });
  });

  describe('Multiple Campaign Scenarios', () => {
    test('should distribute proportionally based on QF scores', () => {
      const result = calculateQfDistribution(
        mockedQfRoundMultipleCampaigns.state!,
      );
      expect(result).toEqual(mockedQfRoundMultipleCampaigns.distribution);
    });

    test('should handle decimal matching pools correctly', () => {
      const result = calculateQfDistribution(mockedQfRoundDecimalPool.state!);
      expect(result).toEqual(mockedQfRoundDecimalPool.distribution);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small contributions', () => {
      const result = calculateQfDistribution(
        mockedQfRoundSmallContributions.state!,
      );
      expect(result).toEqual(mockedQfRoundSmallContributions.distribution);
    });

    test('should handle large contributions', () => {
      const result = calculateQfDistribution(
        mockedQfRoundLargeContributions.state!,
      );
      expect(result).toEqual(mockedQfRoundLargeContributions.distribution);
    });

    test('should handle mixed payment statuses correctly', () => {
      const result = calculateQfDistribution(mockedQfRoundMixedStatus.state!);
      expect(result).toEqual(mockedQfRoundMixedStatus.distribution);
    });
  });

  describe('Precision Handling and Dust Distribution', () => {
    test('should apply precision correctly and distribute dust', () => {
      const result = calculateQfDistribution(
        mockedQfRoundDecimalPool.state!,
        2,
      );
      const distributionResult = {
        distribution: [
          {
            id: 100,
            matchingAmount: '500.063456',
            nContributions: 1,
            nUniqueContributors: 1,
            title: 'Campaign 1',
          },
          {
            id: 101,
            matchingAmount: '500.06',
            nContributions: 4,
            nUniqueContributors: 4,
            title: 'Campaign 2',
          },
        ],
        totalAllocated: '1000.123456',
      };

      expect(result).toEqual(distributionResult);
    });
  });
});
