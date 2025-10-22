import { formatUnits, parseUnits } from 'viem';
import { debugQf as debug } from '@/lib/debug';
import { Decimal } from '@/server/db';
import type { QfPaymentDB, QfCampaignDB, QfRoundDB } from '@/lib/api/types';
import { USD_DECIMALS } from '@/lib/constant';
import type { QfCampaign, QfRound, UserID } from '@/lib/qf';

function parseContributionForQf(payment: QfPaymentDB) {
  const token = payment.token;
  const userId = payment.userId;
  const decimals = USD_DECIMALS; // USDC

  const amount = parseUnits(payment.amount, decimals);

  return {
    userId,
    amount,
    token,
  };
}

export function aggregateContributionsByUser(contributions: QfPaymentDB[]): {
  aggregatedContributionsByUser: Record<UserID, string>;
  nUniqueContributors: number;
  nContributions: number;
} {
  const sumByUser: Record<UserID, bigint> = {};

  debug &&
    console.log(`[QF Parse] Aggregating ${contributions.length} contributions`);

  for (const contribution of contributions) {
    const parsedContribution = parseContributionForQf(contribution);
    const currentSum = sumByUser[parsedContribution.userId] ?? 0n;
    sumByUser[parsedContribution.userId] =
      currentSum + parsedContribution.amount;
  }

  debug &&
    console.log(
      `[QF Parse] Aggregated to ${Object.keys(sumByUser).length} unique users`,
    );
  const sumByUserEntries = Object.entries(sumByUser);
  return {
    aggregatedContributionsByUser: Object.fromEntries(
      sumByUserEntries.map(([userId, amount]) => [
        userId,
        formatUnits(amount, USD_DECIMALS),
      ]),
    ),
    nUniqueContributors: sumByUserEntries.length,
    nContributions: contributions.length,
  };
}

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

export function parseRoundForQf(round: QfRoundDB): QfRound {
  debug &&
    console.log(`[QF Parse] Parsing round ${round.id}: "${round.title}"`);
  debug && console.log(`[QF Parse]  - Status: ${round.status}`);
  debug && console.log(`[QF Parse]  - Blockchain: ${round.blockchain}`);
  debug &&
    console.log('[QF Parse]  - Matching pool (Decimal):', round.matchingPool);
  debug &&
    console.log(
      `[QF Parse]  - Number of round campaigns: ${round.roundCampaigns.length}`,
    );

  const campaigns = round.roundCampaigns.map(parseCampaignForQf);

  const matchingPoolDecimals = USD_DECIMALS; // USDC
  const matchingPoolBigInt = BigInt(
    round.matchingPool.mul(Decimal.pow(10, matchingPoolDecimals)).toFixed(0),
  );

  debug &&
    console.log(
      `[QF Parse] Converted matching pool ${round.matchingPool} to BigInt: ${matchingPoolBigInt}`,
    );

  const matchingPool = formatUnits(matchingPoolBigInt, matchingPoolDecimals);

  return {
    id: round.id,
    title: round.title,
    matchingPool,
    blockchain: round.blockchain,
    status: round.status,
    campaigns,
  };
}
