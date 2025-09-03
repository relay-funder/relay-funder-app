import { createTreasuryManager } from '@/lib/treasury/interface';
import { response, handleError } from '@/lib/api/response';
import { ApiParameterError, ApiNotFoundError } from '@/lib/api/error';
import { CampaignsWithIdParams } from '@/lib/api/types';

export async function GET(
  request: Request,
  { params }: CampaignsWithIdParams
) {
  try {
    const { campaignId: campaignIdOrSlug } = await params;

    if (!campaignIdOrSlug) {
      throw new ApiParameterError('Campaign ID is required');
    }

    // Parse campaign ID (could be ID or slug)
    const campaignId = parseInt(campaignIdOrSlug);
    if (isNaN(campaignId)) {
      throw new ApiParameterError('Invalid campaign ID format');
    }

    const treasuryManager = await createTreasuryManager();
    const treasuryAddress = await treasuryManager.getAddress(campaignId);

    if (!treasuryAddress) {
      return response({
        balance: null,
        message: 'No treasury found for this campaign'
      });
    }

    const balance = await treasuryManager.getBalance(treasuryAddress);

    return response({ balance, treasuryAddress });
  } catch (error: unknown) {
    console.error('Error fetching campaign treasury balance:', error);
    return handleError(error);
  }
}
