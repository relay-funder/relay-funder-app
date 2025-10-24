import { formatUnits, parseUnits } from 'viem';
import { ApiParameterError } from '@/lib/api/error';
import type { QfPaymentDB, QfCampaignDB, QfRoundDB } from '@/lib/api/types';
import { USD_DECIMALS } from '@/lib/constant';
import { debugQf as debug } from '@/lib/debug';
import type { QfCampaign, QfRound, UserID } from '@/lib/qf';
import { Decimal, RecipientStatus } from '@/server/db';

/**
 * Aggregates contributions by user, filtering out invalid contributions and calculating statistics.
 *
 * @param contributions - Array of payment records from the database
 * @returns Object containing aggregated contributions by user and contribution statistics
 *
 * @example
 * ```typescript
 * const result = aggregateContributionsByUser(payments);
 * console.log(result.nUniqueContributors); // Number of unique contributors
 * console.log(result.aggregatedContributionsByUser); // { userId: "amount" }
 * ```
 */
export function aggregateContributionsByUser(contributions: QfPaymentDB[]): {
  aggregatedContributionsByUser: Record<UserID, string>;
  nUniqueContributors: number;
  nContributions: number;
  nInvalidContributions: number;
  nTotalContributions: number;
} {
  let nContributions = 0;
  let nInvalidContributions = 0;
  const nTotalContributions = contributions.length;

  const sumByUser: Record<UserID, bigint> = {};

  debug &&
    console.log(`[QF Parse] Aggregating ${contributions.length} contributions`);

  for (const contribution of contributions) {
    const status = contribution.status;
    if (status !== 'confirmed') {
      nInvalidContributions += 1;
      continue;
    }
    const userId = contribution.user.id;
    const decimals = USD_DECIMALS; // USDC

    const amount = parseUnits(contribution.amount, decimals);

    const currentSum = sumByUser[userId] ?? 0n;
    sumByUser[userId] = currentSum + amount;
    nContributions += 1;
  }

  debug &&
    console.log(
      `[QF Parse] Aggregated to ${Object.keys(sumByUser).length} unique users`,
    );
  const sumByUserEntries = Object.entries(sumByUser);
  const aggregatedContributionsByUser = Object.fromEntries(
    sumByUserEntries.map(([userId, amount]) => [
      userId,
      formatUnits(amount, USD_DECIMALS),
    ]),
  );
  return {
    aggregatedContributionsByUser,
    nUniqueContributors: sumByUserEntries.length,
    nContributions,
    nInvalidContributions,
    nTotalContributions,
  };
}

/**
 * Filters campaigns to only include approved campaigns for QF calculations.
 *
 * @param roundCampaigns - Array of campaign records from the database
 * @returns Filtered array of approved campaigns
 *
 * @example
 * ```typescript
 * const approvedCampaigns = filterApprovedCampaigns(roundCampaigns);
 * console.log(`Found ${approvedCampaigns.length} approved campaigns`);
 * ```
 */
function filterApprovedCampaigns(
  roundCampaigns: QfCampaignDB[],
): QfCampaignDB[] {
  return roundCampaigns.filter((campaign) => {
    const campaignStatus = campaign.status;
    if (campaignStatus === RecipientStatus.APPROVED) {
      return true;
    }
    debug &&
      console.log(
        `[QF Parse] Skipping campaign ${campaign.id}: "${campaign.Campaign.title}" - Status: ${campaignStatus}`,
      );
    return false;
  });
}

/**
 * Parses a single campaign from database format to QF calculation format.
 *
 * @param roundCampaign - Campaign record from the database with payments
 * @returns Parsed campaign data with aggregated contributions
 *
 * @example
 * ```typescript
 * const qfCampaign = parseCampaignForQf(roundCampaign);
 * console.log(qfCampaign.nUniqueContributors); // Number of unique contributors
 * ```
 */
function parseCampaignForQf(roundCampaign: QfCampaignDB): QfCampaign {
  const { Campaign } = roundCampaign;
  const { payments } = Campaign;

  debug &&
    console.log(
      `[QF Parse] Parsing campaign ${Campaign.id}: "${Campaign.title}"`,
    );
  debug && console.log(`[QF Parse]  - Status: ${Campaign.status}`);
  debug && console.log(`[QF Parse]  - Number of payments: ${payments.length}`);

  const { aggregatedContributionsByUser, nUniqueContributors, nContributions } =
    aggregateContributionsByUser(payments);

  return {
    id: Campaign.id,
    title: Campaign.title,
    status: Campaign.status,
    aggregatedContributionsByUser,
    nUniqueContributors,
    nContributions,
  };
}

/**
 * Parses database round data into QF calculation format.
 *
 * This function takes raw round data from the database and transforms it into
 * the format required for quadratic funding calculations. It filters active
 * campaigns, aggregates contributions, and formats monetary amounts.
 *
 * @param round - Raw round data from database containing campaigns and matching pool
 * @returns Parsed QfRound with aggregated contributions and formatted amounts
 * @throws ApiParameterError if round has no campaigns or no matching pool.
 * @throws ApiParameterError if round has no approved campaigns.
 *
 * @example
 * ```typescript
 * try {
 *   const qfRound = parseRoundForQf(roundData);
 *   console.log(`Round ${qfRound.id} has ${qfRound.campaigns.length} campaigns`);
 *   console.log(`Matching pool: ${qfRound.matchingPool}`);
 * } catch (error) {
 *   if (error instanceof ApiParameterError) {
 *     console.error('Round validation failed:', error.message);
 *   }
 * }
 * ```
 */
export function parseRoundForQf(round: QfRoundDB): QfRound {
  const { id, title, blockchain, status, roundCampaigns } = round;

  debug && console.log(`[QF Parse] Parsing round ${id}: "${title}"`);
  debug && console.log(`[QF Parse]  - Status: ${status}`);
  debug && console.log(`[QF Parse]  - Blockchain: ${blockchain}`);
  debug &&
    console.log('[QF Parse]  - Matching pool (Decimal):', round.matchingPool);

  if (round.matchingPool.isZero()) {
    throw new ApiParameterError(
      `Round with id ${round.id} has no matching pool`,
    );
  }

  const matchingPoolDecimals = USD_DECIMALS; // USDC
  const matchingPoolBigInt = BigInt(
    round.matchingPool.mul(Decimal.pow(10, matchingPoolDecimals)).toFixed(0),
  );

  debug &&
    console.log(
      `[QF Parse] Converted matching pool ${round.matchingPool} to BigInt: ${matchingPoolBigInt}`,
    );

  const matchingPool = formatUnits(matchingPoolBigInt, matchingPoolDecimals);

  const nRoundCampaigns = roundCampaigns.length;
  if (nRoundCampaigns === 0) {
    throw new ApiParameterError(`Round with id ${id} has no campaigns`);
  }
  debug &&
    console.log(`[QF Parse]  - Number of round campaigns: ${nRoundCampaigns}`);

  const approvedCampaigns = filterApprovedCampaigns(roundCampaigns);
  const nApprovedCampaigns = approvedCampaigns.length;
  if (nApprovedCampaigns === 0) {
    throw new ApiParameterError(
      `Round with id ${id} has no approved campaigns`,
    );
  }
  debug &&
    console.log(
      `[QF Parse] Number of approved round campaigns: ${nApprovedCampaigns}`,
    );

  const campaigns = approvedCampaigns.map(parseCampaignForQf);

  return {
    id,
    title,
    matchingPool,
    blockchain,
    status,
    campaigns,
  };
}
