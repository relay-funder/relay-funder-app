import { checkAuth } from '@/lib/api/auth';
import { ApiParameterError } from '@/lib/api/error';
import { response, handleError } from '@/lib/api/response';
import { getCampaignPaymentsForReconciliation } from '@/lib/api/adminPayments';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    await checkAuth(['admin']);

    const { campaignId } = await params;
    const campaignIdNum = Number.parseInt(campaignId);

    if (Number.isNaN(campaignIdNum)) {
      throw new ApiParameterError('Invalid campaignId');
    }

    const payments = await getCampaignPaymentsForReconciliation(campaignIdNum);

    return response({ payments });
  } catch (error: unknown) {
    return handleError(error);
  }
}
