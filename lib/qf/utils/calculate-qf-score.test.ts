import { describe, test, expect } from 'vitest';
import { calculateQfScore } from './calculate-qf-score';

describe('calculateQfScore', () => {
  describe('Edge Cases', () => {
    test('empty array -> 0', () => {
      expect(calculateQfScore([])).toBe(0n);
    });

    test('single zero amounts -> 0', () => {
      expect(calculateQfScore([0n])).toBe(0n);
      expect(calculateQfScore([0n, 0n, 0n])).toBe(0n);
    });

    test('mixed zero and non-zero amounts', () => {
      expect(calculateQfScore([0n, 4n])).toBe(4n);
      expect(calculateQfScore([0n, 0n, 9n])).toBe(9n);
    });
  });

  describe('Perfect Squares', () => {
    test('single perfect square amount', () => {
      expect(calculateQfScore([1n])).toBe(1n);
      expect(calculateQfScore([4n])).toBe(4n);
      expect(calculateQfScore([9n])).toBe(9n);
      expect(calculateQfScore([16n])).toBe(16n);
    });

    test('multiple identical perfect squares', () => {
      expect(calculateQfScore([1n, 1n, 1n, 1n])).toBe(16n); // [1,1,1,1] -> (1+1+1+1)^2 = 16
      expect(calculateQfScore([4n, 4n, 4n])).toBe(36n); // [4,4,4] -> (2+2+2)^2 = 36
      expect(calculateQfScore([9n, 9n, 9n, 9n])).toBe(144n); // [9,9,9,9] -> (3+3+3+3)^2 = 144
    });

    test('different perfect squares', () => {
      expect(calculateQfScore([1n, 4n, 9n])).toBe(36n); // [1,4,9] -> (1+2+3)^2 = 36
      expect(calculateQfScore([16n, 25n, 36n])).toBe(225n); // [16,25,36] -> (4+5+6)^2 = 225
    });
  });

  describe('Non-Perfect Squares', () => {
    test('single non-perfect square', () => {
      expect(calculateQfScore([2n])).toBe(1n); // sqrt(2) = 1 (floored), score = (1)^2 = 1
      expect(calculateQfScore([3n])).toBe(1n); // sqrt(3) = 1 (floored), score = (1)^2 = 1
      expect(calculateQfScore([8n])).toBe(4n); // sqrt(8) = 2 (floored), score = (2)^2 = 4
    });

    test('multiple non-perfect squares', () => {
      expect(calculateQfScore([2n, 3n])).toBe(4n); // [2,3] -> (1+1)^2 = 4
      expect(calculateQfScore([5n, 6n, 7n])).toBe(36n); // [5,6,7] -> (2+2+2)^2 = 36
    });

    test('mixed perfect and non-perfect squares', () => {
      expect(calculateQfScore([2n, 4n])).toBe(9n); // [2,4] -> (1+2)^2 = 9
      expect(calculateQfScore([1n, 16n])).toBe(25n); // [1,16] -> (1 + 4)^2 = 25
      expect(calculateQfScore([3n, 9n, 15n])).toBe(49n); // [3,9,15] -> (1+3+3)^2 = 49
    });
  });

  describe('Integer Sqrt Flooring Behavior', () => {
    test('values that floor to same sqrt have same score', () => {
      expect(calculateQfScore([9n, 9n])).toBe(36n); // [9,9] -> (3+3)^2 = 36
      expect(calculateQfScore([10n, 10n])).toBe(36n); // [10,10] -> (3+3)^2 = 36
      expect(calculateQfScore([11n, 11n])).toBe(36n); // [11,11] -> (3+3)^2 = 36
      expect(calculateQfScore([12n, 12n])).toBe(36n); // [12,12] -> (3+3)^2 = 36
      expect(calculateQfScore([13n, 13n])).toBe(36n); // [13,13] -> (3+3)^2 = 36
      expect(calculateQfScore([14n, 14n])).toBe(36n); // [14,14] -> (3+3)^2 = 36
      expect(calculateQfScore([15n, 15n])).toBe(36n); // [15,15] -> (3+3)^2 = 36
      expect(calculateQfScore([15n, 9n])).toBe(36n); // [15,9] -> (3+3)^2 = 36
    });

    test('boundary values around perfect squares', () => {
      expect(calculateQfScore([8n])).toBe(4n); // [8] -> (2)^2 = 4
      expect(calculateQfScore([9n])).toBe(9n); // [9] -> (3)^2 = 9
      expect(calculateQfScore([10n])).toBe(9n); // [10] -> (3)^2 = 9
      expect(calculateQfScore([24n])).toBe(16n); // [24] -> (4)^2 = 16
      expect(calculateQfScore([25n])).toBe(25n); // [25] -> (5)^2 = 25
      expect(calculateQfScore([26n])).toBe(25n); // [26] -> (5)^2 = 25
    });
  });

  describe('QF Formula Properties', () => {
    test('more contributors with same total gives higher score', () => {
      expect(calculateQfScore([100n])).toBe(100n); // [100] -> (10)^2 = 100
      expect(calculateQfScore([50n, 50n])).toBe(196n); // [50,50] -> (7+7)^2 = 196
      expect(calculateQfScore([25n, 25n, 25n, 25n])).toBe(400n); // [25,25,25,25] -> (5+5+5+5)^2 = 400
    });

    test('breadth is rewarded over depth', () => {
      expect(calculateQfScore([10000n])).toBe(10000n); // [10000] -> (100)^2 = 10000
      const smallContributions = Array(100).fill(100n);
      expect(calculateQfScore(smallContributions)).toBe(1000000n); // [100,100,100,...,100] -> (10+10+10+...+10)^2 = 1000000
    });
  });

  describe('Large Values and BigInt Precision', () => {
    test('very large values maintain precision', () => {
      const a = 10_000_000_000_000n;
      const b = 90_000_000_000_000n;
      const score = calculateQfScore([a, b]);
      expect(score).toBe(159999958493881n); // [10_000_000_000_000, 90_000_000_000_000] -> (3162277 + 9486832)^2 = 159999958493881
    });

    test('very large bigint values', () => {
      // Test with values that would overflow regular JavaScript numbers
      const largeValue1 = 2n ** 100n; // 2^100
      const largeValue2 = 2n ** 200n; // 2^200

      const score = calculateQfScore([largeValue1, largeValue2]);

      expect(score).toBeGreaterThan(0n);
      expect(typeof score).toBe('bigint');

      // Verify mathematical correctness
      // sqrt(2^100) = 2^50, sqrt(2^200) = 2^100
      // sum = 2^50 + 2^100, score = (2^50 + 2^100)^2
      const sqrt1 = 2n ** 50n;
      const sqrt2 = 2n ** 100n;
      const expectedScore = (sqrt1 + sqrt2) ** 2n;

      expect(score).toBe(expectedScore);
    });
  });

  describe('Performance and Many Contributors', () => {
    test('handles many contributors efficiently', () => {
      // Test with 1000 contributors of 1 unit each
      const manyContributions = Array(1000).fill(1n);
      const score = calculateQfScore(manyContributions);

      // sqrt(1) * 1000 = 1 * 1000 = 1000, score = 1000000
      expect(score).toBe(1000000n);
    });
  });
});
