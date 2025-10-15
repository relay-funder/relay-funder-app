import { checkAuth, checkContractAdmin } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { CampaignsWithIdParams } from '@/lib/api/types';
import { updateCampaignTransaction } from '@/lib/api/campaigns';

interface UpdateTransactionBody {
  transactionHash: string;
  campaignAddress?: string;
}

export async function POST(req: Request, { params }: CampaignsWithIdParams) {
  try {
    const session = await checkAuth(['admin']);
    await checkContractAdmin(session);

    const campaignId = parseInt((await params).campaignId);
    if (!campaignId) {
      throw new ApiParameterError('campaignId is required');
    }

    const { transactionHash, campaignAddress }: UpdateTransactionBody =
      await req.json();

    if (!transactionHash) {
      throw new ApiParameterError('transactionHash is required');
    }

    // Update campaign in database with contract info
    await updateCampaignTransaction({
      id: campaignId,
      transactionHash,
      campaignAddress,
    });

    return response({ success: true });
  } catch (error: unknown) {
    return handleError(error);
  }
}
