import { ApiNotFoundError } from '@/lib/api/error';
import { debugQf as debug } from '@/lib/debug';
import { calculateQfDistribution, QfCampaignMatching } from '@/lib/qf';
import { getQfRoundState } from './get-qf-state';

/**
 * Computes the Quadratic Funding distribution for a given round id.
 *
 * Flow:
 * 1) Get QF round state via `getQfRoundState` (which fetches round from DB, validates, and parses).
 * 2) Run the QF calculator (`calculateQfDistribution`) on the state.
 * 3) Find the specific campaign in the distribution and return its matching amount.
 *
 * @param roundId - Round id (database primary key).
 * @param campaignId - Campaign id (database primary key).
 * @returns string with the matching amount for the campaign.
 * @throws ApiNotFoundError if the round is missing, has no campaigns, or has no matching pool.
 */
export async function getQfCampaignMatching(
  roundId: number,
  campaignId: number,
): Promise<QfCampaignMatching> {
  debug &&
    console.log(
      `[QF Campaign] Starting Qf matching calculation for round ${roundId} and campaign ${campaignId}`,
    );

  const state = await getQfRoundState(roundId);

  const { distribution } = calculateQfDistribution(state);

  const campaignDistribution = distribution.find(
    (campaign) => campaign.id === campaignId,
  );

  if (!campaignDistribution) {
    throw new ApiNotFoundError('Campaign matching amount not found');
  }

  debug &&
    console.log(
      `[QF Campaign] Matching amount for campaign ${campaignId} in round ${roundId}: ${campaignDistribution.matchingAmount}`,
    );

  return {
    matchingAmount: campaignDistribution.matchingAmount,
    nUniqueContributors: campaignDistribution.nUniqueContributors,
    nContributions: campaignDistribution.nContributions,
  };
}
