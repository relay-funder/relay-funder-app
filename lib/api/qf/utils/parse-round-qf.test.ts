import { describe, test, expect, vi } from 'vitest';
import { Decimal } from '@/server/db';
import { QfRoundDB } from '@/lib/api/types';
import { parseRoundForQf } from '@/lib/api/qf/utils/parse-round-qf';
import { QfRound } from '@/lib/qf';
import {
  mockedQfRoundEmpty,
  mockedQfRoundNoPayments,
  mockedQfRoundAggregationSameUser,
  mockedQfRoundDecimalContributions,
  mockedQfRoundSmallContributions,
  mockedQfRoundLargeContributions,
  mockedQfRoundZeroMatchingPool,
  mockedQfRoundPendingPayments,
  mockedQfRoundMixedStatus,
  mockedQfRoundMultipleCampaigns,
} from '@/lib/api/qf/__mocks__/rounds.mock';
import { ApiParameterError } from '@/lib/api/error';
import { USD_TOKEN } from '@/lib/constant';

vi.mock('@/lib/debug', () => ({
  debugQf: false,
}));

describe('parseRoundForQf', () => {
  describe('Basic Functionality', () => {
    test('should parse round with multiple campaigns and contributions', () => {
      const result = parseRoundForQf(mockedQfRoundMultipleCampaigns.round);
      expect(result).toEqual(mockedQfRoundMultipleCampaigns.parsed);
    });

    test('should throw ApiParameterError when round has no campaigns', () => {
      expect(() => parseRoundForQf(mockedQfRoundEmpty.round)).toThrow(
        ApiParameterError,
      );
      expect(() => parseRoundForQf(mockedQfRoundEmpty.round)).toThrow(
        'Round with id 1 has no campaigns',
      );
    });

    test('should handle campaign with no payments', () => {
      const result = parseRoundForQf(mockedQfRoundNoPayments.round);
      expect(result).toEqual(mockedQfRoundNoPayments.parsed);
    });
  });

  describe('Contribution Aggregation', () => {
    test('should aggregate multiple contributions from same user', () => {
      const result = parseRoundForQf(mockedQfRoundAggregationSameUser.round);
      expect(result).toEqual(mockedQfRoundAggregationSameUser.parsed);
    });
  });

  describe('Decimal Precision', () => {
    test('should handle different decimal amounts correctly', () => {
      const result = parseRoundForQf(mockedQfRoundDecimalContributions.round);

      expect(result).toEqual(mockedQfRoundDecimalContributions.parsed);
    });

    test('should handle very small amounts', () => {
      const result = parseRoundForQf(mockedQfRoundSmallContributions.round);
      expect(result).toEqual(mockedQfRoundSmallContributions.parsed);
    });

    test('should handle large amounts', () => {
      const result = parseRoundForQf(mockedQfRoundLargeContributions.round);
      expect(result).toEqual(mockedQfRoundLargeContributions.parsed);
    });
  });

  describe('Matching Pool Conversion', () => {
    test('should handle different matching pool amounts', () => {
      const testCases = [
        { input: '1', expected: '1' },
        { input: '1000', expected: '1000' },
        { input: '1000000', expected: '1000000' },
        { input: '0.1', expected: '0.1' },
        { input: '1000.123456', expected: '1000.123456' },
        { input: '1000000000', expected: '1000000000' },
      ];

      testCases.forEach(({ input, expected }) => {
        const round: QfRoundDB = {
          id: 1,
          title: 'Matching Pool Test',
          matchingPool: new Decimal(input),
          startDate: new Date(),
          endDate: new Date(),
          blockchain: 'ethereum',
          status: 'ACTIVE',
          roundCampaigns: [
            {
              id: 1,
              Campaign: {
                id: 1,
                title: 'Campaign 1',
                status: 'ACTIVE',
                payments: [
                  {
                    amount: '100',
                    token: USD_TOKEN,
                    status: 'confirmed',
                    user: { id: 1, address: '0x123' },
                  },
                ],
              },
              status: 'APPROVED',
            },
          ],
        };

        const roundResult: QfRound = {
          id: 1,
          title: 'Matching Pool Test',
          matchingPool: expected,
          blockchain: 'ethereum',
          status: 'ACTIVE',
          campaigns: [
            {
              id: 1,
              title: 'Campaign 1',
              status: 'ACTIVE',
              aggregatedContributionsByUser: { 1: '100' },
              nUniqueContributors: 1,
              nContributions: 1,
            },
          ],
        };

        const result = parseRoundForQf(round);
        expect(result).toEqual(roundResult);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should throw ApiParameterError when round has zero matching pool', () => {
      expect(() =>
        parseRoundForQf(mockedQfRoundZeroMatchingPool.round),
      ).toThrow(ApiParameterError);
      expect(() =>
        parseRoundForQf(mockedQfRoundZeroMatchingPool.round),
      ).toThrow('Round with id 1 has no matching pool');
    });

    test('should handle campaign with only pending payments', () => {
      const result = parseRoundForQf(mockedQfRoundPendingPayments.round);
      expect(result).toEqual(mockedQfRoundPendingPayments.parsed);
    });

    test('should handle mixed payment statuses', () => {
      const result = parseRoundForQf(mockedQfRoundMixedStatus.round);
      expect(result).toEqual(mockedQfRoundMixedStatus.parsed);
    });
  });
});
