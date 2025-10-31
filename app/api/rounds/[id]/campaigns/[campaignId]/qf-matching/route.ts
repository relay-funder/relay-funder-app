import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { checkAuth } from '@/lib/api/auth';
import { RoundsWithIdAndCampaignIdParams } from '@/lib/api/types';
import { getQfCampaignMatching } from '@/lib/api/qf';

export async function GET(
  req: Request,
  { params }: RoundsWithIdAndCampaignIdParams,
) {
  try {
    await checkAuth(['user']);
    const { id, campaignId: campaignIdParam } = await params;
    const roundId = Number(id);
    const campaignId = Number(campaignIdParam);
    if (!Number.isInteger(roundId)) {
      throw new ApiParameterError('Invalid round id');
    }
    if (!Number.isInteger(campaignId)) {
      throw new ApiParameterError('Invalid campaign id');
    }
    const matchingAmount = await getQfCampaignMatching(roundId, campaignId);

    return response(matchingAmount);
  } catch (error: unknown) {
    return handleError(error);
  }
}
