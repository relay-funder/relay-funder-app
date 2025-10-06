import { describe, test, expect, vi } from 'vitest';
import { Decimal } from '@/server/db';
import { parseRoundForQF } from './parse-round-qf';
import { QFRoundDB } from '../types';

vi.mock('@/lib/debug', () => ({
  debugApi: false,
}));

describe('parseRoundForQF', () => {
  test('should parse round with multiple campaigns and contributions', () => {
    const round: QFRoundDB = {
      id: 1,
      title: 'Test Round',
      matchingPool: new Decimal('1000'), // 1000 USDC
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
            title: 'Campaign 1',
            status: 'ACTIVE',
            payments: [
              { amount: '10.0', token: 'USDC', status: 'confirmed', userId: 1 },
              { amount: '5.0', token: 'USDC', status: 'confirmed', userId: 1 }, // Same user, should be aggregated
              { amount: '20.0', token: 'USDC', status: 'confirmed', userId: 2 },
            ],
          },
        },
        {
          id: 2,
          status: 'APPROVED',
          Campaign: {
            id: 101,
            title: 'Campaign 2',
            status: 'ACTIVE',
            payments: [
              { amount: '15.0', token: 'USDC', status: 'confirmed', userId: 3 },
              { amount: '25.0', token: 'USDC', status: 'confirmed', userId: 4 },
            ],
          },
        },
      ],
    };

    const result = parseRoundForQF(round);

    expect(result.id).toBe(1);
    expect(result.title).toBe('Test Round');
    expect(result.matchingPool).toBe(1000000000n); // 1000 USDC
    expect(result.blockchain).toBe('ethereum');
    expect(result.status).toBe('ACTIVE');
    expect(result.campaigns).toHaveLength(2);

    // Test Campaign 1
    const campaign1 = result.campaigns[0];
    expect(campaign1.id).toBe(100);
    expect(campaign1.title).toBe('Campaign 1');
    expect(campaign1.status).toBe('ACTIVE');
    expect(campaign1.contributions).toHaveLength(3);

    // Test contributions: user 1 has 10.0 + 5.0 = 15.0 USDC
    expect(campaign1.contributions[0].amount).toBe('10.0'); // 10.0 USDC
    expect(campaign1.contributions[1].amount).toBe('5.0'); // 5.0 USDC
    expect(campaign1.contributions[2].amount).toBe('20.0'); // 20.0 USDC

    // Test aggregation: user 1 has 10.0 + 5.0 = 15.0 USDC
    expect(campaign1.aggregatedContributionsByUser[1]).toBe(15000000n); // 15.0 USDC
    expect(campaign1.aggregatedContributionsByUser[2]).toBe(20000000n); // 20.0 USDC
    expect(Object.keys(campaign1.aggregatedContributionsByUser).length).toBe(2);

    // Test Campaign 2
    const campaign2 = result.campaigns[1];
    expect(campaign2.id).toBe(101);
    expect(campaign2.title).toBe('Campaign 2');
    expect(campaign2.status).toBe('ACTIVE');
    expect(campaign2.contributions).toHaveLength(2);

    // Test contributions: user 3 has 15.0 USDC, user 4 has 25.0 USDC
    expect(campaign2.contributions[0].amount).toBe('15.0'); // 15.0 USDC
    expect(campaign2.contributions[1].amount).toBe('25.0'); // 25.0 USDC

    // Test aggregation: user 3 has 15.0 USDC, user 4 has 25.0 USDC
    expect(campaign2.aggregatedContributionsByUser[3]).toBe(15000000n); // 15.0 USDC
    expect(campaign2.aggregatedContributionsByUser[4]).toBe(25000000n); // 25.0 USDC
    expect(Object.keys(campaign2.aggregatedContributionsByUser).length).toBe(2);
  });

  test('should handle round with no campaigns', () => {
    const round: QFRoundDB = {
      id: 1,
      title: 'Empty Round',
      matchingPool: new Decimal('10000'), // 10000 USDC
      startDate: new Date(),
      endDate: new Date(),
      blockchain: 'ethereum',
      status: 'ACTIVE',
      roundCampaigns: [],
    };

    const result = parseRoundForQF(round);

    expect(result.id).toBe(1);
    expect(result.title).toBe('Empty Round');
    expect(result.matchingPool).toBe(10000000000n); // 10000 USDC = 10000 * 10^6 with 6 decimals
    expect(result.campaigns).toHaveLength(0);
  });

  test('should handle campaign with no payments', () => {
    const round: QFRoundDB = {
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
            title: 'No Payments Campaign',
            status: 'ACTIVE',
            payments: [],
          },
        },
      ],
    };

    const result = parseRoundForQF(round);

    expect(result.campaigns).toHaveLength(1);
    const campaign = result.campaigns[0];
    expect(campaign.id).toBe(100);
    expect(campaign.title).toBe('No Payments Campaign');
    expect(campaign.contributions).toHaveLength(0);
    expect(Object.keys(campaign.aggregatedContributionsByUser).length).toBe(0);
  });

  test('should handle different decimal amounts correctly', () => {
    const round: QFRoundDB = {
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
            title: 'Decimal Test Campaign',
            status: 'ACTIVE',
            payments: [
              {
                amount: '10.75',
                token: 'USDC',
                status: 'confirmed',
                userId: 1,
              },
              {
                amount: '15.10',
                token: 'USDC',
                status: 'confirmed',
                userId: 2,
              },
              {
                amount: '100.25',
                token: 'USDC',
                status: 'confirmed',
                userId: 3,
              },
            ],
          },
        },
      ],
    };

    const result = parseRoundForQF(round);

    const campaign = result.campaigns[0];
    expect(campaign.aggregatedContributionsByUser[1]).toBe(10750000n); // 10 USDC = 10 * 10^6
    expect(campaign.aggregatedContributionsByUser[2]).toBe(15100000n); // 15 USDC = 15 * 10^6
    expect(campaign.aggregatedContributionsByUser[3]).toBe(100250000n); // 100.25 USDC = 100.25 * 10^6
  });

  test('should handle matching pool conversion correctly', () => {
    const round: QFRoundDB = {
      id: 1,
      title: 'Test Round',
      matchingPool: new Decimal('500'), // 500 USDC
      startDate: new Date(),
      endDate: new Date(),
      blockchain: 'ethereum',
      status: 'ACTIVE',
      roundCampaigns: [],
    };

    const result = parseRoundForQF(round);

    expect(result.matchingPool).toBe(500000000n); // 500 USDC = 500 * 10^6
  });
});
