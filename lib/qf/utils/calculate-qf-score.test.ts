import { describe, test, expect } from 'vitest';
import { calculateQfScore } from './calculate-qf-score';

describe('calculateQfScore', () => {
  test('empty array -> 0', () => {
    expect(calculateQfScore([])).toBe(0n);
  });

  test('single perfect square amount', () => {
    // sqrt(16) = 4; score = (4)^2 = 16
    expect(calculateQfScore([16n])).toBe(16n);
  });

  test('multiple perfect square amounts', () => {
    // [1,1,1,1] -> (1+1+1+1)^2 = 16
    expect(calculateQfScore([1n, 1n, 1n, 1n])).toBe(16n);

    // [4,4,4] -> (2+2+2)^2 = 36
    expect(calculateQfScore([4n, 4n, 4n])).toBe(36n);
  });

  test('mixed amounts with integer sqrt', () => {
    // [2,4] -> (1+2)^2 = 9
    expect(calculateQfScore([2n, 4n])).toBe(9n);

    // sqrt(9) = 3 (integer), [9,9] -> (3+3)^2 = 36
    expect(calculateQfScore([9n, 9n])).toBe(36n);

    // [1,16] -> (1 + 4)^2 = 25
    expect(calculateQfScore([1n, 16n])).toBe(25n);
  });

  test('different small values can have similar scores', () => {
    // sqrt(9 ~ 15) = 3 (integer) -> (3+3)^2 = 36
    expect(calculateQfScore([9n, 9n])).toBe(36n);
    expect(calculateQfScore([10n, 10n])).toBe(36n);
    expect(calculateQfScore([11n, 11n])).toBe(36n);
    expect(calculateQfScore([12n, 12n])).toBe(36n);
    expect(calculateQfScore([13n, 13n])).toBe(36n);
    expect(calculateQfScore([14n, 14n])).toBe(36n);
    expect(calculateQfScore([15n, 15n])).toBe(36n);
    expect(calculateQfScore([15n, 9n])).toBe(36n);
  });

  test('large values', () => {
    // sqrt(10_000_000_000_000) = 3162277
    // sqrt(90_000_000_000_000) = 9486832
    // (3162277 + 9486832)^2 = 159999958493881

    // Use big values to ensure bigint/math stability
    const a = 10_000_000_000_000n;
    const b = 90_000_000_000_000n;
    const score = calculateQfScore([a, b]);
    expect(score).toBe(159999958493881n);
  });
});
