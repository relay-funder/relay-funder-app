import { ApiNotFoundError } from '@/lib/api/error';
import { debugQf as debug } from '@/lib/debug';
import { USD_DECIMALS, USD_TOKEN } from '@/lib/constant';
import { QfRoundState } from '@/lib/qf';
import { getRoundForCalculationQuery } from './queries';
import { parseRoundForQf } from './utils';

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
