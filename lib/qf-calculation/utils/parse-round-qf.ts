import { parseUnits } from 'viem';
import { debugApi as debug } from '@/lib/debug';
import { Decimal } from '@/server/db';
import type {
  QFCampaign,
  QFRound,
  QFCampaignDB,
  QFPaymentDB,
  QFRoundDB,
  UserID,
} from '../types';

function parseContributionForQF(payment: QFPaymentDB) {
  const token = payment.token;
  const userId = payment.userId;
  const decimals = 6; // USDC

  const amount = parseUnits(payment.amount, decimals);

  return {
    userId,
    amount,
    token,
  };
}

function aggregateContributionsByUser(
  contributions: QFPaymentDB[],
): Record<UserID, bigint> {
  const sumByUser: Record<UserID, bigint> = {};

  debug &&
    console.log(`[QF Parse] Aggregating ${contributions.length} contributions`);

  for (const contribution of contributions) {
    const parsedContribution = parseContributionForQF(contribution);
    const currentSum = sumByUser[parsedContribution.userId] ?? 0n;
    sumByUser[parsedContribution.userId] =
      currentSum + parsedContribution.amount;
  }

  debug &&
    console.log(
      `[QF Parse] Aggregated to ${Object.keys(sumByUser).length} unique users`,
    );
  return sumByUser;
}

function parseCampaignForQF(roundCampaign: QFCampaignDB): QFCampaign {
  const { Campaign } = roundCampaign;
  const { payments } = Campaign;

  debug &&
    console.log(
      `[QF Parse] Parsing campaign ${Campaign.id}: "${Campaign.title}"`,
    );
  debug && console.log(`  - Status: ${Campaign.status}`);
  debug && console.log(`  - Number of payments: ${payments.length}`);

  const aggregatedContributionsByUser = aggregateContributionsByUser(payments);

  return {
    id: Campaign.id,
    title: Campaign.title,
    status: Campaign.status,
    aggregatedContributionsByUser,
    contributions: payments,
  };
}

export function parseRoundForQF(round: QFRoundDB): QFRound {
  debug &&
    console.log(`[QF Parse] Parsing round ${round.id}: "${round.title}"`);
  debug && console.log(`  - Status: ${round.status}`);
  debug && console.log(`  - Blockchain: ${round.blockchain}`);
  debug && console.log('  - Matching pool (Decimal):', round.matchingPool);
  debug &&
    console.log(
      `  - Number of round campaigns: ${round.roundCampaigns.length}`,
    );

  const campaigns = round.roundCampaigns.map((roundCampaign) => {
    const campaign = parseCampaignForQF(roundCampaign);
    return campaign;
  });

  const matchingPoolDecimals = 6; // USDC
  const matchingPool = BigInt(
    round.matchingPool.mul(Decimal.pow(10, matchingPoolDecimals)).toFixed(0),
  );

  debug &&
    console.log(
      `[QF Parse] Converted matching pool ${round.matchingPool} to BigInt: ${matchingPool}`,
    );

  return {
    id: round.id,
    title: round.title,
    matchingPool,
    blockchain: round.blockchain,
    status: round.status,
    campaigns,
  };
}
