import { describe, test, expect, vi } from 'vitest';
import { ApiNotFoundError } from '@/lib/api/error';
import { Decimal } from '@/server/db';
import { getRoundQFDistribution } from './get-qf-distribution';
import { getRoundForCalculationQuery } from './queries';
import { parseRoundForQF, calculateQFDistribution } from './utils';
import type { QFRoundDB } from './types';

vi.mock('@/lib/debug', () => ({
  debugApi: false,
}));

vi.mock('./queries', () => ({
  getRoundForCalculationQuery: vi.fn(),
}));

vi.mock('./utils', () => ({
  parseRoundForQF: vi.fn(),
  calculateQFDistribution: vi.fn(),
}));

describe('getRoundQFDistribution', () => {
  test('should throw error when round does not exist', async () => {
    vi.mocked(getRoundForCalculationQuery).mockResolvedValue(null);

    await expect(getRoundQFDistribution(999)).rejects.toThrow(ApiNotFoundError);
    await expect(getRoundQFDistribution(999)).rejects.toThrow(
      'Round with id 999 does not exist',
    );
  });

  test('should throw error when round has no campaigns', async () => {
    const mockRound: QFRoundDB = {
      id: 1,
      title: 'Empty Round',
      matchingPool: new Decimal('1000000000'),
      startDate: new Date(),
      endDate: new Date(),
      blockchain: 'ethereum',
      status: 'ACTIVE',
      roundCampaigns: [],
    };

    vi.mocked(getRoundForCalculationQuery).mockResolvedValue(mockRound);
    vi.mocked(parseRoundForQF).mockReturnValue({
      id: 1,
      title: 'Empty Round',
      matchingPool: 1000000000n,
      blockchain: 'ethereum',
      status: 'ACTIVE',
      campaigns: [], // No campaigns
    });

    await expect(getRoundQFDistribution(1)).rejects.toThrow(ApiNotFoundError);
    await expect(getRoundQFDistribution(1)).rejects.toThrow(
      'Round with id 1 has no campaigns',
    );
  });

  test('should throw error when round has no matching pool', async () => {
    const mockRound: QFRoundDB = {
      id: 1,
      title: 'No Matching Pool',
      matchingPool: new Decimal('0'),
      startDate: new Date(),
      endDate: new Date(),
      blockchain: 'ethereum',
      status: 'ACTIVE',
      roundCampaigns: [
        {
          id: 1,
          status: 'APPROVED',
          Campaign: {
            id: 100,
            title: 'Test Campaign',
            status: 'ACTIVE',
            payments: [],
          },
        },
      ],
    };

    vi.mocked(getRoundForCalculationQuery).mockResolvedValue(mockRound);
    vi.mocked(parseRoundForQF).mockReturnValue({
      id: 1,
      title: 'No Matching Pool',
      matchingPool: 0n, // No matching pool
      blockchain: 'ethereum',
      status: 'ACTIVE',
      campaigns: [
        {
          id: 100,
          title: 'Test Campaign',
          status: 'ACTIVE',
          contributions: [],
          aggregatedContributionsByUser: { 1: 10000000n },
        },
      ],
    });

    await expect(getRoundQFDistribution(1)).rejects.toThrow(ApiNotFoundError);
    await expect(getRoundQFDistribution(1)).rejects.toThrow(
      'Round with id 1 has no matching pool',
    );
  });

  test('should successfully calculate QF distribution', async () => {
    const mockRound: QFRoundDB = {
      id: 1,
      title: 'Test Round',
      matchingPool: new Decimal('1000000000'),
      startDate: new Date(),
      endDate: new Date(),
      blockchain: 'ethereum',
      status: 'ACTIVE',
      roundCampaigns: [
        {
          id: 1,
          status: 'APPROVED',
          Campaign: {
            id: 100,
            title: 'Test Campaign',
            status: 'ACTIVE',
            payments: [
              { amount: '10.0', token: 'USDC', status: 'confirmed', userId: 1 },
            ],
          },
        },
      ],
    };

    const mockParsedRound = {
      id: 1,
      title: 'Test Round',
      matchingPool: 1000000000n,
      blockchain: 'ethereum',
      status: 'ACTIVE',
      campaigns: [
        {
          id: 100,
          title: 'Test Campaign',
          status: 'ACTIVE',
          contributions: [],
          aggregatedContributionsByUser: { 1: 10000000n },
        },
      ],
    };

    const mockResult = {
      totalAllocated: '1000000000',
      distribution: [
        { id: 100, title: 'Test Campaign', matchingAmount: '1000000000' },
      ],
    };

    vi.mocked(getRoundForCalculationQuery).mockResolvedValue(mockRound);
    vi.mocked(parseRoundForQF).mockReturnValue(mockParsedRound);
    vi.mocked(calculateQFDistribution).mockReturnValue(mockResult);

    const result = await getRoundQFDistribution(1);

    expect(result).toEqual(mockResult);
    expect(getRoundForCalculationQuery).toHaveBeenCalledWith(1);
    expect(parseRoundForQF).toHaveBeenCalledWith(mockRound);
    expect(calculateQFDistribution).toHaveBeenCalledWith({
      campaigns: mockParsedRound.campaigns,
      matchingPool: mockParsedRound.matchingPool,
    });
  });
});
