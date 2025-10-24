import { debugQf as debug } from '@/lib/debug';
import { QfCalculationResult, QfDistribution, QfRoundState } from './types';
import { formatUnits, parseUnits } from 'viem';
import { calculateQfScore } from './calculate-qf-score';
import { truncateToTokenPrecision } from './token-amount';

/**
 * Quadratic Funding distribution calculator.
 *
 * High‑level overview:
 * - For each campaign, we compute a Qf score: (sum over unique contributors of sqrt(total contributed by that user)))^2.
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
 * Computes the Qf matching distribution for a round of campaigns.
 *
 * Algorithm:
 * 1) Early exit optimization if there's only one campaign:
 *    - If it has any contributions, allocate the entire matching pool to it.
 *    - Otherwise allocate zero.
 * 2) Compute each campaign score with Qf formula: (Σ sqrt(user_total))^2.
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
 * - `distribution`: array of QfDistribution items with campaign id, title and matchingAmountformatted string (e.g., "123.45") in token units.
 * - `totalAllocated`: string of the sum of all formatted allocations.
 *
 * @param state - The QF round state containing campaigns and matching pool
 * @param precision - How many decimals to keep when allocating (default 0 for whole tokens)
 * @returns QfCalculationResult with distribution array of human‑readable matching amounts and total
 *
 * @example
 * ```typescript
 * const result = calculateQfDistribution(roundState, 2);
 * console.log(result.totalAllocated); // "1000.00"
 * console.log(result.distribution[0].matchingAmount); // "500.00"
 * ```
 */
export function calculateQfDistribution(
  state: QfRoundState,
  precision?: number,
): QfCalculationResult {
  const { campaigns, tokenDecimals } = state;
  const matchingPool = parseUnits(state.matchingPool, tokenDecimals);

  debug && console.log(`[QF Calc] Starting Qf distribution calculation`);
  debug && console.log(`[QF Calc]  - Matching pool: ${state.matchingPool}`);
  debug &&
    console.log(`[QF Calc]  - Number of campaigns: ${state.campaigns.length}`);
  debug && console.log(`[QF Calc]  - Token decimals: ${tokenDecimals}`);
  debug && console.log(`[QF Calc]  - Precision: ${precision}`);

  const distribution: QfDistribution = [];

  // Early return optimization: if only one campaign with contributions, give it all the matching pool
  if (campaigns.length === 1) {
    const campaign = campaigns[0];
    const hasContributions = campaign.nContributions > 0;

    if (hasContributions) {
      debug &&
        console.log(
          `[QF Calc] Single campaign with contributions - allocating entire matching pool`,
        );
      const matchingPool = formatUnits(
        parseUnits(state.matchingPool, tokenDecimals),
        tokenDecimals,
      );
      const matchingAmount = matchingPool;
      distribution.push({
        id: campaign.id,
        title: campaign.title,
        matchingAmount,
        nUniqueContributors: campaign.nUniqueContributors,
        nContributions: campaign.nContributions,
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
        nUniqueContributors: campaign.nUniqueContributors,
        nContributions: campaign.nContributions,
      });
      return { totalAllocated: '0', distribution };
    }
  }

  let totalScore = 0n;
  let totalAllocated = 0n;

  // Compute score per campaign based on quadratic funding formula
  // score = (sum of sqrt(user contributions))^2
  const campaignScores = campaigns.map(
    ({
      id,
      title,
      aggregatedContributionsByUser,
      nUniqueContributors,
      nContributions,
    }) => {
      const amounts = Object.values(aggregatedContributionsByUser).map(
        (amount) => parseUnits(amount, tokenDecimals),
      );
      const score = calculateQfScore(amounts);

      debug &&
        console.log(
          `[QF Calc] Campaign ${id} score: ${score} (${amounts.length} contributors)`,
        );

      totalScore += score;
      return { id, title, score, nUniqueContributors, nContributions };
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

    campaigns.forEach(({ id, title, nUniqueContributors, nContributions }) => {
      distribution.push({
        id,
        title,
        matchingAmount: '0',
        nUniqueContributors,
        nContributions,
      });
    });
    return { totalAllocated: '0', distribution };
  }

  // Proportional allocation (integer math), rounded down per the requested precision.
  // We track the campaign with the largest rounded allocation to receive any leftover dust.
  let maxAllocation = { index: 0, matchingAmount: 0n };

  const preliminaryAllocations = campaignScores.map(
    ({ id, title, score, nUniqueContributors, nContributions }, i) => {
      const amount = (matchingPool * score) / totalScore;

      // Apply precision rounding (truncate).
      const matchingAmount = truncateToTokenPrecision({
        amount,
        tokenDecimals,
        precisionDecimals: precision,
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
      return { id, title, matchingAmount, nUniqueContributors, nContributions };
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
  preliminaryAllocations.forEach(
    ({ id, title, matchingAmount, nUniqueContributors, nContributions }) => {
      distribution.push({
        id,
        title,
        matchingAmount: formatUnits(matchingAmount, tokenDecimals),
        nUniqueContributors,
        nContributions,
      });
    },
  );

  debug && console.log(`[QF Calc] Final total allocated: ${totalAllocated}`);
  debug &&
    console.log(
      `[QF Calc] Distribution completed with ${distribution.length} campaigns`,
    );
  return {
    totalAllocated: formatUnits(totalAllocated, tokenDecimals),
    distribution,
  };
}
