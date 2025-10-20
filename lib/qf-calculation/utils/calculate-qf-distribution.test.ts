import { formatUnits, parseUnits } from 'viem';
import { describe, test, expect, vi } from 'vitest';
import { calculateQFDistribution } from './calculate-qf-distribution';
import type { QFCalculationResult, QFCampaign } from '../types';
import {
  precision10Results,
  precision1Results,
  precision3Results,
  precisionCampaigns,
} from '../mocks';
import { USDC_DECIMALS } from '@/lib/constant';

vi.mock('@/lib/debug', () => ({
  debugApi: false,
}));

describe('calculateQFDistribution', () => {
  test('should calculate QF distribution with equal contributions', () => {
    const contribution = parseUnits('10', USDC_DECIMALS);
    const campaigns: QFCampaign[] = [
      {
        id: 1,
        title: 'Campaign 1',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          1: contribution,
          2: contribution,
        },
      },
      {
        id: 2,
        title: 'Campaign 2',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          3: contribution,
          4: contribution,
        },
      },
    ];

    const matchingPool = parseUnits('1000', USDC_DECIMALS);

    const result: QFCalculationResult = calculateQFDistribution({
      campaigns,
      matchingPool,
    });

    // Both campaigns should get equal allocation since they have equal QF scores
    // QF score = (sqrt(10) + sqrt(10))^2 = (2*sqrt(10))^2 = 4*10 = 40
    // Total score = 40 + 40 = 80
    // Each campaign gets 40/80 = 0.5 of the matching pool = 500 USDC
    expect(result.totalAllocated).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );
    expect(result.distribution.length).toBe(2);
    expect(result.distribution[0]?.matchingAmount).toBe('500'); // 500 USDC
    expect(result.distribution[1]?.matchingAmount).toBe('500'); // 500 USDC
  });

  test('should calculate QF distribution with different contribution patterns', () => {
    const contributionA = parseUnits('1', USDC_DECIMALS);
    const contributionB = parseUnits('16', USDC_DECIMALS);
    const campaigns: QFCampaign[] = [
      {
        id: 1,
        title: 'Diverse Support',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          1: contributionA, // 1 USDC
          2: contributionA, // 1 USDC
          3: contributionA, // 1 USDC
          4: contributionA, // 1 USDC
        },
      },
      {
        id: 2,
        title: 'Concentrated Support',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          5: contributionB, // 16 USDC (single large contribution)
        },
      },
    ];

    const matchingPool = parseUnits('1000', USDC_DECIMALS);

    const result: QFCalculationResult = calculateQFDistribution({
      campaigns,
      matchingPool,
    });

    // Campaign 1 QF score: (sqrt(1) + sqrt(1) + sqrt(1) + sqrt(1))^2 = (1+1+1+1)^2 = 16
    // Campaign 2 QF score: (sqrt(16))^2 = 4^2 = 16
    // Both have equal scores, so equal allocation
    expect(result.totalAllocated).toBe('1000');
    expect(result.distribution[0]?.matchingAmount).toBe('500'); // 500 USDC
    expect(result.distribution[1]?.matchingAmount).toBe('500'); // 500 USDC
  });

  test('should handle dust distribution correctly', () => {
    const contribution = 1000000n; // 1 USDC
    const campaigns: QFCampaign[] = [
      {
        id: 1,
        title: 'Campaign 1',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          1: contribution, // 1 USDC
        },
      },
      {
        id: 2,
        title: 'Campaign 2',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          2: contribution, // 1 USDC
        },
      },
    ];

    const matchingPool = 3000000n; // 3 USDC

    const result: QFCalculationResult = calculateQFDistribution({
      campaigns,
      matchingPool,
    });

    // Both campaigns have QF score of 1, so each gets 1/2 = 1 (integer division)
    // Total allocated = 1 + 1 = 2
    // Dust = 3 - 2 = 1
    // With new logic: dustPerCampaign = 1/2 = 0, dustRemainder = 1 - 0*2 = 1
    // Campaign 1 gets 1 + 1 = 2, Campaign 2 gets 0 + 1 = 1
    expect(result.totalAllocated).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );
    expect(result.distribution[0]?.matchingAmount).toBe(
      formatUnits(2000000n, USDC_DECIMALS),
    ); // Gets dustPerCampaign + remainder
    expect(result.distribution[1]?.matchingAmount).toBe(
      formatUnits(1000000n, USDC_DECIMALS),
    ); // Gets dustPerCampaign
  });

  test('should handle single campaign', () => {
    const contribution = 10000000n; // 10 USDC
    const campaigns: QFCampaign[] = [
      {
        id: 1,
        title: 'Single Campaign',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          1: contribution, // 10 USDC
          2: contribution, // 10 USDC
        },
      },
    ];

    const matchingPool = 1000000000n; // 1000 USDC

    const result: QFCalculationResult = calculateQFDistribution({
      campaigns,
      matchingPool,
    });

    // Single campaign gets all the matching pool
    expect(result.totalAllocated).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );
    expect(Object.keys(result.distribution).length).toBe(1);
    expect(result.distribution[0]?.matchingAmount).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );
  });

  test('should demonstrate quadratic funding advantage for diverse support', () => {
    const contributionA = 1000000n; // 1 USDC
    const contributionB = 10000000n; // 10 USDC
    const campaigns: QFCampaign[] = [
      {
        id: 1,
        title: 'Many Small Contributors',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          1: contributionA, // 1 USDC each
          2: contributionA,
          3: contributionA,
          4: contributionA,
          5: contributionA,
          6: contributionA,
          7: contributionA,
          8: contributionA,
          9: contributionA,
          10: contributionA,
        },
      },
      {
        id: 2,
        title: 'Few Large Contributors',
        status: 'ACTIVE',
        contributions: [],
        aggregatedContributionsByUser: {
          11: contributionB, // 10 USDC
        },
      },
    ];

    const matchingPool = 1000000000n; // 1000 USDC

    const result: QFCalculationResult = calculateQFDistribution({
      campaigns,
      matchingPool,
    });

    // Campaign 1 QF score: (10 * sqrt(1))^2 = 10^2 = 100
    // Campaign 2 QF score: (sqrt(10))^2 = 10
    // Total score = 110
    // Campaign 1 gets 100/110 ≈ 0.909 of matching pool
    // Campaign 2 gets 10/110 ≈ 0.091 of matching pool

    const campaign1Allocation = parseUnits(
      result.distribution[0]?.matchingAmount,
      USDC_DECIMALS,
    );
    const campaign2Allocation = parseUnits(
      result.distribution[1]?.matchingAmount,
      USDC_DECIMALS,
    );

    expect(campaign1Allocation).toBeGreaterThan(campaign2Allocation);
    expect(campaign1Allocation + campaign2Allocation).toBe(matchingPool);
  });

  test('precision=1 (decimals), 1000 USDC pool, dust handled', () => {
    const precision = 1;
    const matchingPool = parseUnits('1000', USDC_DECIMALS);
    const campaigns: QFCampaign[] = precisionCampaigns;

    const result: QFCalculationResult = calculateQFDistribution({
      campaigns,
      matchingPool,
      tokenDecimals: USDC_DECIMALS,
      precision,
    });

    // Total equals pool (dust fully assigned)
    expect(result.totalAllocated).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );

    // Quantized to 1 decimal: factor = 10^(6-1) = 100000
    const factor = 10n ** BigInt(USDC_DECIMALS - precision);
    let sum = 0n;
    result.distribution.forEach((campaign) => {
      expect(campaign.matchingAmount).toBe(precision1Results[campaign.id]);

      const amt = parseUnits(campaign.matchingAmount, USDC_DECIMALS);
      expect(amt % factor).toBe(0n);

      sum += amt;
    });

    expect(sum).toBe(matchingPool);
  });

  test('precision=3 (decimals), 1000 USDC pool, dust handled', () => {
    const precision = 3; // thousandths
    const matchingPool = parseUnits('1000', USDC_DECIMALS);
    const campaigns: QFCampaign[] = precisionCampaigns;

    const result = calculateQFDistribution({
      campaigns,
      matchingPool,
      tokenDecimals: USDC_DECIMALS,
      precision,
    });

    expect(result.totalAllocated).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );

    // Quantized to 3 decimals: factor = 10^(6-3) = 1000
    const factor = 10n ** BigInt(USDC_DECIMALS - precision);
    let sum = 0n;
    result.distribution.forEach((campaign) => {
      expect(campaign.matchingAmount).toBe(precision3Results[campaign.id]);

      const amt = parseUnits(campaign.matchingAmount, USDC_DECIMALS);
      expect(amt % factor).toBe(0n);

      sum += amt;
    });

    expect(sum).toBe(matchingPool);
  });

  test('precision=10 clamps to token decimals (no rounding), 1000 USDC pool', () => {
    const precision = 10; // > token decimals
    const matchingPool = parseUnits('1000', USDC_DECIMALS);
    const campaigns: QFCampaign[] = precisionCampaigns;

    const result = calculateQFDistribution({
      campaigns,
      matchingPool,
      tokenDecimals: USDC_DECIMALS,
      precision,
    });

    // Total is the pool
    expect(result.totalAllocated).toBe(
      formatUnits(matchingPool, USDC_DECIMALS),
    );

    // Since precision > token decimals, no further rounding — factor = 10^(6-6) = 1 → anything % 1 == 0
    const factor =
      10n ** BigInt(USDC_DECIMALS - Math.min(precision, USDC_DECIMALS)); // 1

    let sum = 0n;
    result.distribution.forEach((campaign) => {
      expect(campaign.matchingAmount).toBe(precision10Results[campaign.id]);

      const amt = parseUnits(campaign.matchingAmount, USDC_DECIMALS);
      expect(amt % factor).toBe(0n);

      sum += amt;
    });

    expect(sum).toBe(matchingPool);
  });
});
