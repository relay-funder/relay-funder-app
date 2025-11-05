import { getQfRoundState } from '@/lib/api/qf';
import { debugQf as debug } from '@/lib/debug';
import { QfCalculationResult } from '@/lib/qf/types';
import { calculateQfDistribution } from '@/lib/qf/utils';

/**
 * Computes the Quadratic Funding distribution for a given round id.
 *
 * Flow:
 * 1) Get the QF round state (includes round data, campaigns, and validation).
 * 2) Run the QF calculator (`calculateQfDistribution`) and return the result.
 *
 * @param id - Round id (database primary key).
 * @returns QfCalculationResult with distribution array of human‑readable matching amounts and total.
 * @throws ApiNotFoundError if round doesn't exist.
 * @throws ApiParameterError if round has no campaigns or no matching pool.
 * @throws ApiParameterError if round has no approved campaigns.
 */
export async function getRoundQfDistribution(
  id: number,
): Promise<QfCalculationResult> {
  debug &&
    console.log(`[QF] Starting Qf distribution calculation for round ${id}`);

  const state = await getQfRoundState(id);

  const result = calculateQfDistribution(state);

  debug &&
    result.distribution.forEach(({ id, title, matchingAmount }) => {
      console.log(`[QF] ${id}: ${title} - ${matchingAmount}`);
    });
  debug && console.log(`[QF] Total allocated: ${result.totalAllocated}`);
  return result;
}
