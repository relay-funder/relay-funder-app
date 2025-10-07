import { debugApi as debug } from '@/lib/debug';
import { QFCalculationResult, QFDistribution, QFRound } from '../types';
import { formatUnits } from 'viem';
import { calculateQfScore } from './calculate-qf-score';

/**
 * Quadratic Funding distribution calculator.
 *
 * High‑level overview:
 * - For each campaign, we compute a QF score: (sum over unique contributors of sqrt(total contributed by that user)))^2.
 * - The matching pool is allocated proportionally to campaign scores.
 * - Rounding is applied to control precision (e.g. to whole tokens), and any "dust" from rounding is given to the first largest allocation.
 *
 * Key properties:
 * - The use of sqrt before summing rewards breadth of unique contributors over large single donations.
 * - All math is done in bigint at the smallest token unit (e.g., 10^-6 for USDC with 6 decimals).
 * - `formatUnits` is only used for the final, human‑readable string amounts.
 *
 * TODO:
 * - Decide a fair way to distribute the dust
 * - Token decimals can be taken from the token address
 */

/**
 * Rounds an on‑chain amount down to a desired precision (in decimals), preserving token decimals semantics.
 *
 * Example:
 * - tokenDecimals = 6 (USDC), precisionDecimals = 0 → round down to whole tokens (strip fractional micro‑units).
 * - tokenDecimals = 6, precisionDecimals = 2 → keep two decimals (cent‑like behavior).
 *
 * Notes:
 * - If `precisionDecimals >= tokenDecimals`, no rounding is applied.
 * - Rounding is always DOWN via integer division, to avoid over‑allocating.
 *
 * @param amount - Amount in smallest token units - wei (bigint).
 * @param tokenDecimals - Number of decimals for the token (e.g., 6 for USDC).
 * @param precisionDecimals - Desired number of decimals to preserve in distribution.
 * @returns Rounded down bigint in smallest token units.
 */
function roundToPrecision({
  amount,
  tokenDecimals,
  precisionDecimals,
}: {
  amount: bigint;
  tokenDecimals: number;
  precisionDecimals: number;
}): bigint {
  debug &&
    console.log(
      `[QF Calc] Rounding ${amount} to ${precisionDecimals} decimals`,
    );

  if (precisionDecimals >= tokenDecimals) return amount;

  // Example: tokenDecimals=6, precisionDecimals=0 → factor=10^(6-0)=1_000_000
  // Truncate to the nearest multiple of factor (round down).
  const factor = 10n ** BigInt(tokenDecimals - precisionDecimals);
  const rounded = (amount / factor) * factor;

  debug &&
    console.log(
      `[QF Calc] Rounded ${amount} to ${precisionDecimals} decimals: ${rounded}`,
    );
  return rounded;
}

/**
 * Computes the QF matching distribution for a round of campaigns.
 *
 * Algorithm:
 * 1) Early exit optimization if there's only one campaign:
 *    - If it has any contributions, allocate the entire matching pool to it.
 *    - Otherwise allocate zero.
 * 2) Compute each campaign score with QF formula: (Σ sqrt(user_total))^2.
 * 3) Allocate `matchingPool * score / totalScore` to each campaign (in smallest unit, bigint).
 * 4) Apply rounding down to respect desired precision.
 * 5) Distribute any leftover "dust" (from rounding down) to the campaign with the largest preliminary allocation.
 * 6) Produce human‑readable strings via `formatUnits` for output. (bigints cant be serialized to json)
 *
 * Inputs:
 * - `campaigns[].aggregatedContributionsByUser`: per‑user total contribution in smallest units (bigint).
 * - `matchingPool`: total pool in smallest units (bigint).
 *
 * Rounding:
 * - Controlled by `precision`. For example, with USDC 6 decimals:
 *   - precision=0 → whole USDC
 *   - precision=2 → 2 decimal places
 *   - precision=6 → full precision (no rounding)
 *
 * Output:
 * - `distribution`: array of QFDistribution items with campaign id, title and matchingAmountformatted string (e.g., "123.45") in token units.
 * - `totalAllocated`: string of the sum of all formatted allocations.
 *
 * @param campaigns - The set of campaigns with per‑user aggregated contributions.
 * @param matchingPool - Total matching pool in smallest token units (bigint).
 * @param tokenDecimals - Token decimals (default 6 for USDC).
 * @param precision - How many decimals to keep when allocating (default 0 for whole tokens).
 * @returns QFCalculationResult with distribution array of human‑readable matching amounts and total.
 */
export function calculateQFDistribution({
  campaigns,
  matchingPool,
  tokenDecimals = 6, // Matching pool token decimals, USDC
  precision = 0, // Precision decimals for distribution, used for rounding
}: Pick<QFRound, 'campaigns' | 'matchingPool'> & {
  tokenDecimals?: number;
  precision?: number;
}): QFCalculationResult {
  debug && console.log(`[QF Calc] Starting QF distribution calculation`);
  debug && console.log(`  - Matching pool: ${matchingPool}`);
  debug && console.log(`  - Number of campaigns: ${campaigns.length}`);

  // Ensure precision does not exceed token decimals.
  const precisionDecimals =
    precision > tokenDecimals ? tokenDecimals : precision;

  const distribution: QFDistribution = [];

  // Early return optimization: if only one campaign with contributions, give it all the matching pool
  if (campaigns.length === 1) {
    const campaign = campaigns[0];
    const hasContributions =
      Object.keys(campaign.aggregatedContributionsByUser).length > 0;

    if (hasContributions) {
      debug &&
        console.log(
          `[QF Calc] Single campaign with contributions - allocating entire matching pool`,
        );
      const matchingAmount = formatUnits(matchingPool, tokenDecimals);
      distribution.push({
        id: campaign.id,
        title: campaign.title,
        matchingAmount,
      });
      const totalAllocated = matchingAmount;
      return {
        totalAllocated,
        distribution,
      };
    } else {
      debug &&
        console.log(
          `[QF Calc] Single campaign with no contributions - zero allocation`,
        );
      distribution.push({
        id: campaign.id,
        title: campaign.title,
        matchingAmount: '0',
      });
      return { totalAllocated: '0', distribution };
    }
  }

  let totalScore = 0n;
  let totalAllocated = 0n;

  // Compute score per campaign based on quadratic funding formula
  // score = (sum of sqrt(user contributions))^2
  const campaignScores = campaigns.map(
    ({ id, title, aggregatedContributionsByUser }) => {
      const amounts = Object.values(aggregatedContributionsByUser);
      const score = calculateQfScore(amounts);

      debug &&
        console.log(
          `[QF Calc] Campaign ${id} score: ${score} (${amounts.length} contributors)`,
        );

      totalScore += score;
      return { id, title, score };
    },
  );

  debug &&
    console.log(`[QF Calc] Total score across all campaigns: ${totalScore}`);

  // Handle edge case: no contributions → zero allocations for all.
  if (totalScore === 0n) {
    debug &&
      console.log(
        `[QF Calc] No contributions found, returning zero allocations`,
      );

    campaigns.forEach(({ id, title }) => {
      distribution.push({ id, title, matchingAmount: '0' });
    });
    return { totalAllocated: '0', distribution };
  }

  // Proportional allocation (integer math), rounded down per the requested precision.
  // We track the campaign with the largest rounded allocation to receive any leftover dust.
  let maxAllocation = { index: 0, matchingAmount: 0n };

  const preliminaryAllocations = campaignScores.map(
    ({ id, title, score }, i) => {
      const amount = (matchingPool * score) / totalScore;

      // Apply precision rounding (down).
      const matchingAmount = roundToPrecision({
        amount,
        tokenDecimals,
        precisionDecimals,
      });
      totalAllocated += matchingAmount;
      debug &&
        console.log(
          `[QF Calc] Campaign ${id} preliminary allocation: ${matchingAmount}`,
        );

      // Track max allocation (post‑rounding) for "dust" addition.
      if (matchingAmount > maxAllocation.matchingAmount) {
        maxAllocation = { index: i, matchingAmount };
      }
      return { id, title, matchingAmount };
    },
  );

  // Assign any leftover "dust" from rounding/truncation to the campaign with the highest allocation.
  // This guarantees:
  // - We never exceed the matchingPool (only adding remaining dust).
  // - The sum of allocations equals matchingPool exactly (in smallest units).
  const dust = matchingPool - totalAllocated;
  if (dust > 0n) {
    debug &&
      console.log(
        `[QF Calc] Adding dust ${dust} to campaign ${preliminaryAllocations[maxAllocation.index].id}`,
      );

    preliminaryAllocations[maxAllocation.index].matchingAmount += dust;
    totalAllocated += dust;
  }

  // Convert to output structure, formatting units for display/API output.
  preliminaryAllocations.forEach(({ id, title, matchingAmount }) => {
    distribution.push({
      id,
      title,
      matchingAmount: formatUnits(matchingAmount, tokenDecimals),
    });
  });

  debug && console.log(`[QF Calc] Final total allocated: ${totalAllocated}`);
  debug &&
    console.log(
      `[QF Calc] Distribution completed with ${Object.keys(distribution).length} campaigns`,
    );
  return {
    totalAllocated: formatUnits(totalAllocated, tokenDecimals),
    distribution,
  };
}
