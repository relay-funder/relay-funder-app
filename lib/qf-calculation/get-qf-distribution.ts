import { ApiNotFoundError } from '@/lib/api/error';
import { debugApi as debug } from '@/lib/debug';
import type { QFCalculationResult } from './types';
import { getRoundForCalculationQuery } from './queries';
import { calculateQFDistribution, parseRoundForQF } from './utils';

/**
 * Computes the Quadratic Funding distribution for a given round id.
 *
 * Flow:
 * 1) Fetch round from the database.
 * 2) Validate existence; ensure campaigns are present and matching pool > 0.
 * 3) Parse raw round into QF input shape (`parseRoundForQF`).
 * 4) Run the QF calculator (`calculateQFDistribution`) and return the result.
 *
 * @param id - Round id (database primary key).
 * @returns QFCalculationResult with distribution array of human‑readable matching amounts and total.
 * @throws ApiNotFoundError if the round is missing, has no campaigns, or has no matching pool.
 */
export async function getRoundQFDistribution(
  id: number,
): Promise<QFCalculationResult> {
  debug &&
    console.log(`[QF] Starting QF distribution calculation for round ${id}`);
  const round = await getRoundForCalculationQuery(id);

  if (!round) {
    debug && console.error(`[QF] Round with id ${id} does not exist`);
    throw new ApiNotFoundError(`Round with id ${id} does not exist`);
  }

  debug &&
    console.log(`[QF] Round found: ${round.title} (status: ${round.status})`);
  const { campaigns, matchingPool } = parseRoundForQF(round);
  debug && console.log(`[QF] Parsed round data:`);
  debug && console.log(`  - Matching pool: ${matchingPool}`);
  debug && console.log(`  - Number of campaigns: ${campaigns.length}`);

  if (!campaigns || campaigns.length === 0) {
    debug && console.error(`[QF] Round with id ${id} has no campaigns`);
    throw new ApiNotFoundError(`Round with id ${id} has no campaigns`);
  }
  if (matchingPool === 0n) {
    debug && console.error(`[QF] Round with id ${id} has no matching pool`);
    throw new ApiNotFoundError(`Round with id ${id} has no matching pool`);
  }

  debug &&
    console.log(
      `[QF] Starting QF calculation with ${campaigns.length} campaigns`,
    );
  const result = calculateQFDistribution({ campaigns, matchingPool });

  debug && console.log(`[QF] QF calculation completed for round ${id}:`);
  debug && console.log(`  - Total allocated: ${result.totalAllocated}`);
  debug &&
    console.log(
      `  - Distribution entries: ${Object.entries(result.distribution).length}`,
    );

  return result;
}
