import { ApiNotFoundError } from '@/lib/api/error';
import { debugQf as debug } from '@/lib/debug';
import { USD_DECIMALS, USD_TOKEN } from '@/lib/constant';
import { QfRoundState } from '@/lib/qf';
import { getRoundForCalculationQuery } from './queries';
import { parseRoundForQf } from './utils';

/**
 * Fetches and validates a round for QF calculation.
 *
 * Flow:
 * 1) Query database for round with campaigns and payments.
 * 2) Parse and validate round data.
 * 3) Return validated QF round state.
 *
 * @param roundId - Round id (database primary key).
 * @returns QfRoundState with validated round data and campaigns.
 * @throws ApiNotFoundError if round doesn't exist.
 * @throws ApiParameterError if round has no campaigns or no matching pool.
 * @throws ApiParameterError if round has no approved campaigns.
 */
export async function getQfRoundState(roundId: number): Promise<QfRoundState> {
  debug &&
    console.log(`[QF State] Fetching round ${roundId} for calculation state`);
  const roundDb = await getRoundForCalculationQuery(roundId);
  if (!roundDb)
    throw new ApiNotFoundError(`Round with id ${roundId} does not exist`);

  const { id, title, campaigns, matchingPool } = parseRoundForQf(roundDb);

  return {
    id,
    title,
    matchingPool,
    campaigns,
    token: USD_TOKEN,
    tokenDecimals: USD_DECIMALS,
  };
}
