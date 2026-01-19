import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { checkAuth } from '@/lib/api/auth';
import { RoundsWithIdAndCampaignIdParams } from '@/lib/api/types';
import { getQfRoundState } from '@/lib/api/qf';
import { calculateQfDistribution } from '@/lib/qf';
import { parseUnits, formatUnits } from 'viem';

export async function GET(
  req: Request,
  { params }: RoundsWithIdAndCampaignIdParams,
) {
  try {
    const session = await checkAuth(['user']).catch(() => null);
    const userId = session?.user?.id ?? 'simulated_user';

    const { id, campaignId: campaignIdParam } = await params;
    const roundId = Number(id);
    const campaignId = Number(campaignIdParam);

    const url = new URL(req.url);
    const amountStr = url.searchParams.get('amount');

    if (!Number.isInteger(roundId)) {
      throw new ApiParameterError('Invalid round id');
    }
    if (!Number.isInteger(campaignId)) {
      throw new ApiParameterError('Invalid campaign id');
    }

    const parsedAmount = parseFloat(amountStr ?? '');
    if (!amountStr || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return response({
        estimatedMatch: '0',
        marginalMatch: '0',
      });
    }

    // Deep clone state to avoid mutating the cached original
    const state = structuredClone(await getQfRoundState(roundId));

    const baselineDistribution = calculateQfDistribution(state);
    const baselineCampaign = baselineDistribution.distribution.find(
      (c) => c.id === campaignId,
    );
    const baselineMatch = baselineCampaign
      ? parseUnits(baselineCampaign.matchingAmount, state.tokenDecimals)
      : 0n;
    const campaignIndex = state.campaigns.findIndex((c) => c.id === campaignId);
    if (campaignIndex === -1) {
      throw new ApiParameterError('Campaign not found in round');
    }

    const campaign = state.campaigns[campaignIndex];

    const currentContribution = campaign.aggregatedContributionsByUser[userId]
      ? parseUnits(
          campaign.aggregatedContributionsByUser[userId],
          state.tokenDecimals,
        )
      : 0n;

    const additionalContribution = parseUnits(amountStr, state.tokenDecimals);
    const newTotalContribution = currentContribution + additionalContribution;

    campaign.aggregatedContributionsByUser[userId] = formatUnits(
      newTotalContribution,
      state.tokenDecimals,
    );

    if (currentContribution === 0n) {
      campaign.nUniqueContributors += 1;
    }
    campaign.nContributions += 1;

    const simulatedDistribution = calculateQfDistribution(state);
    const simulatedCampaign = simulatedDistribution.distribution.find(
      (c) => c.id === campaignId,
    );
    const simulatedMatch = simulatedCampaign
      ? parseUnits(simulatedCampaign.matchingAmount, state.tokenDecimals)
      : 0n;
    const marginalMatch = simulatedMatch - baselineMatch;

    return response({
      estimatedMatch: formatUnits(simulatedMatch, state.tokenDecimals),
      marginalMatch: formatUnits(
        marginalMatch > 0n ? marginalMatch : 0n,
        state.tokenDecimals,
      ),
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
